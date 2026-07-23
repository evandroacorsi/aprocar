<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$publicDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$partnersDir = $publicDir . '/partners';
$indexPath = $partnersDir . '/index.json';

function partners_request_json(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function partners_ensure_storage(string $partnersDir, string $indexPath): void
{
    if (!is_dir($partnersDir) && !mkdir($partnersDir, 0755, true)) {
        api_respond(500, ['error' => 'Não foi possível preparar o armazenamento de parceiros.']);
    }

    if (!is_file($indexPath)) {
        file_put_contents($indexPath, json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
}

function partners_read(string $indexPath): array
{
    $data = json_decode(file_get_contents($indexPath) ?: '[]', true);
    if (is_array($data['parceiros'] ?? null)) return array_values($data['parceiros']);
    return is_array($data) ? array_values($data) : [];
}

function partners_write(string $indexPath, array $partners): void
{
    if (file_put_contents($indexPath, json_encode(array_values($partners), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) === false) {
        api_respond(500, ['error' => 'Não foi possível salvar os parceiros.']);
    }
}

function partners_text($value, int $maxLength = 160): string
{
    $text = trim((string) $value);
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

function partners_id(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function partners_url($value): string
{
    $url = partners_text($value, 300);
    if ($url === '') return '';

    if (!preg_match('#^https?://#i', $url)) {
        $url = 'https://' . $url;
    }

    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    if (!in_array($scheme, ['http', 'https'], true) || filter_var($url, FILTER_VALIDATE_URL) === false) {
        api_respond(400, ['error' => 'Link inválido. Use uma URL http ou https.']);
    }

    return $url;
}

function partners_item(array $input, ?string $fallbackId = null, ?array $existingPartner = null): array
{
    $nome = partners_text($input['nome'] ?? '');
    $foto = array_key_exists('foto', $input)
        ? partners_text($input['foto'], 300)
        : partners_text($existingPartner['foto'] ?? '', 300);
    $link = array_key_exists('link', $input)
        ? partners_url($input['link'])
        : partners_url($existingPartner['link'] ?? '');

    if ($nome === '') {
        api_respond(400, ['error' => 'Nome do parceiro é obrigatório.']);
    }

    if ($foto !== '' && !preg_match('#^/uploads/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif)$#i', $foto)) {
        api_respond(400, ['error' => 'Foto inválida. Envie a imagem pela área de upload.']);
    }

    $id = $fallbackId ?: partners_id($nome) . '-' . bin2hex(random_bytes(3));
    $partner = ['id' => $id, 'nome' => $nome];
    if ($foto !== '') $partner['foto'] = $foto;
    if ($link !== '') $partner['link'] = $link;

    return $partner;
}

try {
    partners_ensure_storage($partnersDir, $indexPath);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') api_respond(200, ['parceiros' => partners_read($indexPath)]);

    api_assert_admin('parceiros');
    $partners = partners_read($indexPath);
    $body = partners_request_json();

    if ($method === 'POST') {
        $partner = partners_item($body);
        $partners[] = $partner;
        partners_write($indexPath, $partners);
        api_respond(200, ['success' => true, 'parceiro' => $partner]);
    }

    if ($method === 'PUT') {
        $id = partners_text($body['id'] ?? '', 100);
        $index = array_search($id, array_column($partners, 'id'), true);
        if ($id === '' || $index === false) api_respond(404, ['error' => 'Parceiro não encontrado.']);

        $partner = partners_item($body, $id, is_array($partners[$index]) ? $partners[$index] : null);
        $partners[$index] = $partner;
        partners_write($indexPath, $partners);
        api_respond(200, ['success' => true, 'parceiro' => $partner]);
    }

    if ($method === 'DELETE') {
        $id = partners_text($_GET['id'] ?? '', 100);
        $before = count($partners);
        $partners = array_values(array_filter($partners, fn ($partner) => ($partner['id'] ?? '') !== $id));
        if (count($partners) === $before) api_respond(404, ['error' => 'Parceiro não encontrado.']);

        partners_write($indexPath, $partners);
        api_respond(200, ['success' => true]);
    }

    api_respond(405, ['error' => 'Método não permitido.']);
} catch (Throwable $error) {
    api_respond(500, ['error' => $error->getMessage()]);
}
