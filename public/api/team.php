<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$publicDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$teamDir = $publicDir . '/team';
$indexPath = $teamDir . '/index.json';

function team_request_json(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function team_ensure_storage(string $teamDir, string $indexPath): void
{
    if (!is_dir($teamDir) && !mkdir($teamDir, 0755, true)) {
        api_respond(500, ['error' => 'Não foi possível preparar o armazenamento da equipe.']);
    }

    if (!is_file($indexPath)) {
        file_put_contents($indexPath, json_encode(['equipe' => []]), LOCK_EX);
    }
}

function team_read(string $indexPath): array
{
    $data = json_decode(file_get_contents($indexPath) ?: '', true);
    return [
        'equipe' => is_array($data['equipe'] ?? null) ? array_values($data['equipe']) : [],
    ];
}

function team_write(string $indexPath, array $data): void
{
    if (file_put_contents($indexPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) === false) {
        api_respond(500, ['error' => 'Não foi possível salvar as alterações.']);
    }
}

function team_text($value, int $maxLength = 160): string
{
    $text = trim((string) $value);
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

function team_id(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function team_member(array $input, ?string $fallbackId = null, ?array $existingMember = null): array
{
    $nome = team_text($input['nome'] ?? '');
    $cargo = team_text($input['cargo'] ?? '');
    $area = team_text($input['area'] ?? '');
    $foto = array_key_exists('foto', $input)
        ? team_text($input['foto'], 300)
        : team_text($existingMember['foto'] ?? '', 300);

    if ($nome === '' || $cargo === '' || $area === '') {
        api_respond(400, ['error' => 'Nome, cargo e área são obrigatórios.']);
    }

    if ($foto !== '' && !preg_match('#^/uploads/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif)$#i', $foto)) {
        api_respond(400, ['error' => 'Foto inválida. Envie a imagem pela área de upload.']);
    }

    $id = $fallbackId ?: team_id($nome) . '-' . bin2hex(random_bytes(3));
    $member = ['id' => $id, 'nome' => $nome, 'cargo' => $cargo, 'area' => $area];
    if ($foto !== '') $member['foto'] = $foto;

    return $member;
}

try {
    team_ensure_storage($teamDir, $indexPath);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') api_respond(200, team_read($indexPath));

    api_assert_admin('a equipe');
    $data = team_read($indexPath);
    $body = team_request_json();

    if ($method === 'POST') {
        $member = team_member($body);
        $data['equipe'][] = $member;
        team_write($indexPath, $data);
        api_respond(200, ['success' => true, 'membro' => $member]);
    }

    if ($method === 'PUT') {
        $id = team_text($body['id'] ?? '', 100);
        $index = array_search($id, array_column($data['equipe'], 'id'), true);
        if ($id === '' || $index === false) api_respond(404, ['error' => 'Profissional não encontrado.']);

        $member = team_member($body, $id, is_array($data['equipe'][$index]) ? $data['equipe'][$index] : null);
        $data['equipe'][$index] = $member;
        team_write($indexPath, $data);
        api_respond(200, ['success' => true, 'membro' => $member]);
    }

    if ($method === 'DELETE') {
        $id = team_text($_GET['id'] ?? '', 100);
        $before = count($data['equipe']);
        $data['equipe'] = array_values(array_filter($data['equipe'], fn ($member) => ($member['id'] ?? '') !== $id));
        if (count($data['equipe']) === $before) api_respond(404, ['error' => 'Profissional não encontrado.']);

        team_write($indexPath, $data);
        api_respond(200, ['success' => true]);
    }

    api_respond(405, ['error' => 'Método não permitido.']);
} catch (Throwable $error) {
    api_respond(500, ['error' => $error->getMessage()]);
}
