<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function users_request_json(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);

    if ($raw !== '' && json_last_error() !== JSON_ERROR_NONE) {
        api_respond(400, ['error' => 'JSON inválido.']);
    }

    return is_array($data) ? $data : [];
}

function users_error_message(array $response, string $fallback): string
{
    $data = $response['data'] ?? null;
    if (is_array($data)) {
        return (string) ($data['msg'] ?? $data['message'] ?? $data['error_description'] ?? $data['error'] ?? $fallback);
    }

    return $fallback;
}

function users_normalize_role(string $role): string
{
    $role = trim($role);
    if (!in_array($role, ['admin', 'user'], true)) {
        api_respond(400, ['error' => 'Papel inválido.']);
    }

    return $role;
}

function users_set_role(string $userId, string $role): void
{
    $encodedUserId = rawurlencode($userId);
    $delete = api_supabase_service_request('/rest/v1/user_roles?user_id=eq.' . $encodedUserId, 'DELETE', null, [
        'Accept: application/json',
    ]);

    if (!$delete['ok'] && $delete['status'] !== 204) {
        api_respond(500, ['error' => users_error_message($delete, 'Não foi possível atualizar permissões.')]);
    }

    $insert = api_supabase_service_request('/rest/v1/user_roles', 'POST', [
        'user_id' => $userId,
        'role' => $role,
    ], [
        'Accept: application/json',
        'Prefer: return=representation',
    ]);

    if (!$insert['ok']) {
        api_respond(500, ['error' => users_error_message($insert, 'Não foi possível salvar permissões.')]);
    }
}

try {
    api_rate_limit('admin-users:' . api_client_ip(), 120, 60);
    $adminUser = api_assert_admin('usuários');
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $usersResponse = api_supabase_service_request('/auth/v1/admin/users?page=1&per_page=100');
        if (!$usersResponse['ok']) {
            api_respond(500, ['error' => users_error_message($usersResponse, 'Não foi possível listar usuários.')]);
        }

        $rolesResponse = api_supabase_service_request('/rest/v1/user_roles?select=user_id,role', 'GET', null, [
            'Accept: application/json',
        ]);
        $roles = [];
        if ($rolesResponse['ok'] && is_array($rolesResponse['data'])) {
            foreach ($rolesResponse['data'] as $row) {
                if (!is_array($row) || empty($row['user_id']) || empty($row['role'])) continue;
                $roles[(string) $row['user_id']][] = (string) $row['role'];
            }
        }

        $users = [];
        foreach (($usersResponse['data']['users'] ?? []) as $user) {
            if (!is_array($user) || empty($user['id'])) continue;
            $id = (string) $user['id'];
            $metadata = is_array($user['user_metadata'] ?? null) ? $user['user_metadata'] : [];
            $users[] = [
                'id' => $id,
                'email' => (string) ($user['email'] ?? ''),
                'fullName' => (string) ($metadata['full_name'] ?? ''),
                'roles' => $roles[$id] ?? [],
                'createdAt' => (string) ($user['created_at'] ?? ''),
                'lastSignInAt' => (string) ($user['last_sign_in_at'] ?? ''),
            ];
        }

        api_respond(200, [
            'users' => $users,
            'currentUserId' => (string) ($adminUser['id'] ?? ''),
        ]);
    }

    if ($method === 'POST') {
        $body = users_request_json();
        $email = filter_var((string) ($body['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        $password = (string) ($body['password'] ?? '');
        $fullName = trim(strip_tags((string) ($body['fullName'] ?? '')));
        $role = users_normalize_role((string) ($body['role'] ?? 'user'));

        if (!$email) api_respond(400, ['error' => 'E-mail inválido.']);
        if (strlen($password) < 8) api_respond(400, ['error' => 'A senha deve ter pelo menos 8 caracteres.']);
        if (strlen($fullName) > 120) api_respond(400, ['error' => 'Nome muito longo.']);

        $create = api_supabase_service_request('/auth/v1/admin/users', 'POST', [
            'email' => $email,
            'password' => $password,
            'email_confirm' => true,
            'user_metadata' => ['full_name' => $fullName],
        ]);

        if (!$create['ok'] || empty($create['data']['id'])) {
            $status = $create['status'] === 422 ? 409 : 500;
            api_respond($status, ['error' => users_error_message($create, 'Não foi possível criar usuário.')]);
        }

        users_set_role((string) $create['data']['id'], $role);
        api_respond(200, ['success' => true, 'userId' => (string) $create['data']['id']]);
    }

    if ($method === 'PATCH') {
        $body = users_request_json();
        $userId = preg_replace('/[^a-f0-9-]/i', '', (string) ($body['userId'] ?? ''));
        $role = users_normalize_role((string) ($body['role'] ?? 'user'));

        if (!$userId) api_respond(400, ['error' => 'Usuário inválido.']);
        if ($userId === (string) ($adminUser['id'] ?? '') && $role !== 'admin') {
            api_respond(400, ['error' => 'Você não pode remover seu próprio acesso de administrador.']);
        }

        users_set_role($userId, $role);
        api_respond(200, ['success' => true]);
    }

    if ($method === 'DELETE') {
        $userId = preg_replace('/[^a-f0-9-]/i', '', (string) ($_GET['id'] ?? ''));
        if (!$userId) api_respond(400, ['error' => 'Usuário inválido.']);
        if ($userId === (string) ($adminUser['id'] ?? '')) {
            api_respond(400, ['error' => 'Você não pode excluir sua própria conta.']);
        }

        $delete = api_supabase_service_request('/auth/v1/admin/users/' . rawurlencode($userId), 'DELETE');
        if (!$delete['ok']) {
            api_respond(500, ['error' => users_error_message($delete, 'Não foi possível excluir usuário.')]);
        }

        api_respond(200, ['success' => true]);
    }

    api_respond(405, ['error' => 'Método não permitido.']);
} catch (Throwable $error) {
    error_log($error->getMessage());
    api_respond(500, ['error' => 'Erro interno ao gerenciar usuários.']);
}
