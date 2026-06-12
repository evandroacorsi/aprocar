<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$publicDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$uploadsDir = $publicDir . '/uploads';

function ensure_uploads_dir(string $uploadsDir): void
{
    if (!is_dir($uploadsDir) && !mkdir($uploadsDir, 0755, true)) {
        api_respond(500, ['error' => 'Não foi possível criar a pasta de uploads.']);
    }
}

function query_int(string $key, int $default, int $min, int $max): int
{
    $value = filter_input(INPUT_GET, $key, FILTER_VALIDATE_INT);
    if ($value === false || $value === null) return $default;
    return min(max($value, $min), $max);
}

function slugify_media(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function list_media(string $uploadsDir, int $page, int $perPage): array
{
    ensure_uploads_dir($uploadsDir);
    $files = glob($uploadsDir . '/*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE) ?: [];

    usort($files, fn ($a, $b) => filemtime($b) <=> filemtime($a));

    $total = count($files);
    $totalPages = max(1, (int) ceil($total / $perPage));
    $page = min($page, $totalPages);
    $items = array_slice($files, ($page - 1) * $perPage, $perPage);

    return [
        'items' => array_map(fn ($file) => [
            'name' => basename($file),
            'url' => '/uploads/' . basename($file),
            'size' => filesize($file),
            'modifiedAt' => date('c', filemtime($file)),
        ], $items),
        'pagination' => [
            'page' => $page,
            'perPage' => $perPage,
            'total' => $total,
            'totalPages' => $totalPages,
        ],
    ];
}

function media_filename_from_request(): string
{
    $name = trim((string) ($_GET['name'] ?? ''));
    if ($name === '') {
        $url = trim((string) ($_GET['url'] ?? ''));
        $path = parse_url($url, PHP_URL_PATH);
        $name = is_string($path) ? basename($path) : '';
    }

    $name = basename($name);
    if ($name === '' || !preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $name)) {
        api_respond(400, ['error' => 'Imagem inválida.']);
    }

    return $name;
}

function delete_media(string $uploadsDir): void
{
    ensure_uploads_dir($uploadsDir);
    $name = media_filename_from_request();
    $targetPath = $uploadsDir . '/' . $name;
    $realUploadsDir = realpath($uploadsDir);
    $realTargetPath = realpath($targetPath);

    if (!$realUploadsDir || !$realTargetPath || strpos($realTargetPath, $realUploadsDir . DIRECTORY_SEPARATOR) !== 0) {
        api_respond(404, ['error' => 'Imagem não encontrada.']);
    }

    if (!is_file($realTargetPath) || !unlink($realTargetPath)) {
        api_respond(500, ['error' => 'Não foi possível excluir a imagem.']);
    }

    api_respond(200, ['success' => true]);
}

try {
    ensure_uploads_dir($uploadsDir);
    api_assert_admin('imagens');

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $page = query_int('page', 1, 1, 100000);
        $perPage = query_int('perPage', 12, 1, 48);
        $result = list_media($uploadsDir, $page, $perPage);
        api_respond(200, ['media' => $result['items'], 'pagination' => $result['pagination']]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        delete_media($uploadsDir);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        api_respond(405, ['error' => 'Método não permitido.']);
    }

    if (!isset($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
        api_respond(400, ['error' => 'Arquivo de imagem obrigatório.']);
    }

    $file = $_FILES['image'];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        api_respond(400, ['error' => 'Erro ao receber o arquivo.']);
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        api_respond(400, ['error' => 'A imagem deve ter no máximo 5MB.']);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!isset($extensions[$mime])) {
        api_respond(400, ['error' => 'Formato inválido. Use JPG, PNG, WebP ou GIF.']);
    }

    $baseName = pathinfo((string) $file['name'], PATHINFO_FILENAME);
    $safeName = slugify_media($baseName) ?: 'imagem';
    $extension = $extensions[$mime];
    $finalName = $safeName . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(3)) . '.' . $extension;
    $targetPath = $uploadsDir . '/' . $finalName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        api_respond(500, ['error' => 'Não foi possível salvar a imagem no servidor.']);
    }

    api_respond(200, [
        'success' => true,
        'media' => [
            'name' => $finalName,
            'url' => '/uploads/' . $finalName,
            'size' => filesize($targetPath),
            'modifiedAt' => date('c', filemtime($targetPath)),
        ],
    ]);
} catch (Throwable $error) {
    api_respond(500, ['error' => $error->getMessage()]);
}
