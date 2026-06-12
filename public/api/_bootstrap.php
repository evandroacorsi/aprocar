<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function api_respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_load_env_file(string $path): void
{
    if (!is_file($path) || !is_readable($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) return;

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '') continue;
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv($key . '=' . $value);
    }
}

function api_bootstrap_env(): void
{
    foreach ([
        __DIR__ . '/../.env',
        __DIR__ . '/../../.env',
        __DIR__ . '/../../../.env',
    ] as $path) {
        api_load_env_file($path);
    }
}

function api_env(string $key, string $fallback = ''): string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') return (string) $value;
    if (!empty($_ENV[$key])) return (string) $_ENV[$key];
    if (!empty($_SERVER[$key])) return (string) $_SERVER[$key];
    return $fallback;
}

function api_supabase_url(): string
{
    return rtrim(api_env('SUPABASE_URL', api_env('VITE_SUPABASE_URL')), '/');
}

function api_supabase_key(): string
{
    return api_env('SUPABASE_PUBLISHABLE_KEY', api_env('VITE_SUPABASE_PUBLISHABLE_KEY'));
}

function api_site_url(): string
{
    return rtrim(api_env('SITE_URL', api_env('VITE_SITE_URL', 'https://www.aprocar.org.br')), '/');
}

function api_authorization_token(): ?string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $headers['Authorization']
        ?? $headers['authorization']
        ?? '';

    if (substr((string) $header, 0, 7) !== 'Bearer ') return null;
    return substr((string) $header, 7);
}

function api_supabase_request(string $url, string $token, ?array $payload = null): array
{
    if (!function_exists('curl_init')) {
        api_respond(500, ['error' => 'Extensão cURL do PHP não está disponível.']);
    }

    $headers = [
        'apikey: ' . api_supabase_key(),
        'Authorization: Bearer ' . $token,
    ];

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => $headers,
    ];

    if ($payload !== null) {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = json_encode($payload);
        $options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, $options);

    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = is_string($body) && $body !== '' ? json_decode($body, true) : null;

    return [
        'ok' => $body !== false && $status >= 200 && $status < 300,
        'status' => $status,
        'data' => $data,
    ];
}

function api_assert_admin(string $resource = 'conteúdo'): void
{
    $supabaseUrl = api_supabase_url();
    $supabaseKey = api_supabase_key();

    if ($supabaseUrl === '' || $supabaseKey === '') {
        api_respond(500, ['error' => 'Supabase não configurado. Preencha o arquivo .env.']);
    }

    $token = api_authorization_token();
    if (!$token) api_respond(401, ['error' => 'Sessão ausente.']);

    $userResponse = api_supabase_request($supabaseUrl . '/auth/v1/user', $token);
    if (!$userResponse['ok'] || !is_array($userResponse['data']) || empty($userResponse['data']['id'])) {
        api_respond(401, ['error' => 'Sessão inválida.']);
    }

    $roleResponse = api_supabase_request($supabaseUrl . '/rest/v1/rpc/has_role', $token, [
        '_user_id' => (string) $userResponse['data']['id'],
        '_role' => 'admin',
    ]);

    if (!$roleResponse['ok'] || $roleResponse['data'] !== true) {
        api_respond(403, ['error' => 'Acesso negado. Apenas administradores podem gerenciar ' . $resource . '.']);
    }
}

api_bootstrap_env();
