<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$publicDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$faqDir = $publicDir . '/faq';
$indexPath = $faqDir . '/index.json';

function faq_request_json(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function faq_ensure_storage(string $faqDir, string $indexPath): void
{
    if (!is_dir($faqDir) && !mkdir($faqDir, 0755, true)) {
        api_respond(500, ['error' => 'Não foi possível preparar o armazenamento de perguntas frequentes.']);
    }

    if (!is_file($indexPath)) {
        file_put_contents($indexPath, json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
}

function faq_read(string $indexPath): array
{
    $data = json_decode(file_get_contents($indexPath) ?: '[]', true);
    if (is_array($data['perguntas'] ?? null)) return array_values($data['perguntas']);
    return is_array($data) ? array_values($data) : [];
}

function faq_write(string $indexPath, array $items): void
{
    if (file_put_contents($indexPath, json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) === false) {
        api_respond(500, ['error' => 'Não foi possível salvar as perguntas frequentes.']);
    }
}

function faq_text($value, int $maxLength = 2000): string
{
    $text = trim((string) $value);
    return function_exists('mb_substr') ? mb_substr($text, 0, $maxLength) : substr($text, 0, $maxLength);
}

function faq_id(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function faq_item(array $input, ?string $fallbackId = null): array
{
    $pergunta = faq_text($input['pergunta'] ?? '', 240);
    $resposta = faq_text($input['resposta'] ?? '', 2000);

    if ($pergunta === '' || $resposta === '') {
        api_respond(400, ['error' => 'Pergunta e resposta são obrigatórias.']);
    }

    $id = $fallbackId ?: faq_id($pergunta) . '-' . bin2hex(random_bytes(3));
    return ['id' => $id, 'pergunta' => $pergunta, 'resposta' => $resposta];
}

try {
    faq_ensure_storage($faqDir, $indexPath);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') api_respond(200, ['perguntas' => faq_read($indexPath)]);

    api_assert_admin('perguntas frequentes');
    $items = faq_read($indexPath);
    $body = faq_request_json();

    if ($method === 'POST') {
        $item = faq_item($body);
        $items[] = $item;
        faq_write($indexPath, $items);
        api_respond(200, ['success' => true, 'pergunta' => $item]);
    }

    if ($method === 'PUT') {
        $id = faq_text($body['id'] ?? '', 100);
        $index = array_search($id, array_column($items, 'id'), true);
        if ($id === '' || $index === false) api_respond(404, ['error' => 'Pergunta não encontrada.']);

        $item = faq_item($body, $id);
        $items[$index] = $item;
        faq_write($indexPath, $items);
        api_respond(200, ['success' => true, 'pergunta' => $item]);
    }

    if ($method === 'DELETE') {
        $id = faq_text($_GET['id'] ?? '', 100);
        $before = count($items);
        $items = array_values(array_filter($items, fn ($item) => ($item['id'] ?? '') !== $id));
        if (count($items) === $before) api_respond(404, ['error' => 'Pergunta não encontrada.']);

        faq_write($indexPath, $items);
        api_respond(200, ['success' => true]);
    }

    api_respond(405, ['error' => 'Método não permitido.']);
} catch (Throwable $error) {
    api_respond(500, ['error' => $error->getMessage()]);
}
