<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$publicDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$documentsDir = $publicDir . '/documents';
$indexPath = $documentsDir . '/index.json';
const DOCUMENT_MAX_FILE_SIZE = 15 * 1024 * 1024;

function ensure_documents_dir(string $documentsDir): void
{
    if (!is_dir($documentsDir) && !mkdir($documentsDir, 0755, true)) {
        api_respond(500, ['error' => 'Não foi possível criar a pasta de documentos.']);
    }
}

function slugify_document(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    $value = trim($value, '-');
    return substr($value, 0, 80);
}

function load_documents(string $indexPath): array
{
    if (!is_file($indexPath)) return [];

    $raw = file_get_contents($indexPath) ?: '[]';
    $data = json_decode($raw, true);

    return is_array($data) ? $data : [];
}

function save_documents(string $indexPath, array $documents): array
{
    usort($documents, fn ($a, $b) => strcmp((string) ($b['data'] ?? ''), (string) ($a['data'] ?? '')));
    file_put_contents(
        $indexPath,
        json_encode(array_values($documents), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );

    return $documents;
}

function find_document(array $documents, string $id): ?array
{
    foreach ($documents as $document) {
        if (($document['id'] ?? '') === $id) return $document;
    }

    return null;
}

function find_document_index(array $documents, string $id): ?int
{
    foreach ($documents as $index => $document) {
        if (($document['id'] ?? '') === $id) return $index;
    }

    return null;
}

function document_file_path(string $documentsDir, string $arquivo): ?string
{
    $path = parse_url($arquivo, PHP_URL_PATH);
    if (!is_string($path) || $path === '') return null;

    $basename = basename($path);
    if ($basename === '' || !preg_match('/\.pdf$/i', $basename)) return null;

    $targetPath = $documentsDir . '/' . $basename;
    $realDocumentsDir = realpath($documentsDir);
    $realTargetPath = realpath($targetPath);

    if (!$realDocumentsDir) return null;
    if (!$realTargetPath) return is_file($targetPath) ? $targetPath : null;
    if (strpos($realTargetPath, $realDocumentsDir . DIRECTORY_SEPARATOR) !== 0) return null;

    return $realTargetPath;
}

function delete_document_file(string $documentsDir, string $arquivo): void
{
    $filePath = document_file_path($documentsDir, $arquivo);
    if ($filePath && is_file($filePath)) unlink($filePath);
}

function upload_error_message(int $error): string
{
    return match ($error) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'O PDF excede o limite de upload do servidor. Ajuste upload_max_filesize/post_max_size ou envie um arquivo menor.',
        UPLOAD_ERR_PARTIAL => 'O upload do PDF foi interrompido. Tente novamente.',
        UPLOAD_ERR_NO_FILE => 'Arquivo PDF obrigatório.',
        UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE, UPLOAD_ERR_EXTENSION => 'O servidor não conseguiu receber o PDF. Verifique as permissões da pasta temporária.',
        default => 'Erro ao receber o arquivo PDF.',
    };
}

function save_uploaded_pdf(string $documentsDir, array $file, string $baseName): array
{
    if (!isset($file['tmp_name']) || !is_array($file)) {
        api_respond(400, ['error' => 'Arquivo PDF obrigatório.']);
    }

    $uploadError = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($uploadError !== UPLOAD_ERR_OK) {
        api_respond(400, ['error' => upload_error_message($uploadError)]);
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        api_respond(400, ['error' => 'Arquivo PDF obrigatório.']);
    }

    if (($file['size'] ?? 0) > DOCUMENT_MAX_FILE_SIZE) {
        api_respond(400, ['error' => 'O documento deve ter no máximo 15MB.']);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowedMimes = ['application/pdf', 'application/octet-stream', 'application/x-pdf'];

    if (!in_array($mime, $allowedMimes, true)) {
        api_respond(400, ['error' => 'Formato inválido. Envie um arquivo PDF.']);
    }

    if ($mime !== 'application/pdf') {
        $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        if ($extension !== 'pdf') {
            api_respond(400, ['error' => 'Formato inválido. Envie um arquivo PDF.']);
        }
    }

    $safeName = slugify_document($baseName) ?: 'documento';
    $finalName = $safeName . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(3)) . '.pdf';
    $targetPath = $documentsDir . '/' . $finalName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        api_respond(500, ['error' => 'Não foi possível salvar o documento no servidor.']);
    }

    return [
        'name' => $finalName,
        'url' => '/documents/' . $finalName,
        'size' => filesize($targetPath),
        'modifiedAt' => date('c', filemtime($targetPath)),
    ];
}

function document_request_fields(): array
{
    if (str_starts_with((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
        $raw = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    return $_POST;
}

try {
    ensure_documents_dir($documentsDir);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $documents = load_documents($indexPath);
        $id = $_GET['id'] ?? null;

        if ($id) {
            $document = find_document($documents, (string) $id);
            if (!$document) api_respond(404, ['error' => 'Documento não encontrado.']);
            api_respond(200, $document);
        }

        api_respond(200, ['documentos' => save_documents($indexPath, $documents)]);
    }

    api_assert_admin('documentos');

    if ($method === 'POST') {
        $fields = document_request_fields();
        $nome = trim((string) ($fields['nome'] ?? ''));
        $categoria = trim((string) ($fields['categoria'] ?? ''));
        $data = trim((string) ($fields['data'] ?? date('Y')));
        $id = trim((string) ($fields['id'] ?? slugify_document($nome)));
        $isUpdate = trim((string) ($fields['id'] ?? '')) !== '';

        if ($nome === '' || $categoria === '' || $data === '' || $id === '') {
            api_respond(400, ['error' => 'Nome, categoria e data são obrigatórios.']);
        }

        $documents = load_documents($indexPath);
        $existingIndex = $isUpdate ? find_document_index($documents, $id) : null;

        if ($isUpdate && $existingIndex === null) {
            api_respond(404, ['error' => 'Documento não encontrado.']);
        }

        if (!$isUpdate && find_document($documents, $id) !== null) {
            $id = slugify_document($nome) . '-' . time();
        }

        $arquivo = '';
        if ($isUpdate && $existingIndex !== null) {
            $arquivo = (string) ($documents[$existingIndex]['arquivo'] ?? '');
        }

        if (isset($_FILES['file']) && is_array($_FILES['file'])) {
            if ($isUpdate && $arquivo !== '') {
                delete_document_file($documentsDir, $arquivo);
            }

            $uploaded = save_uploaded_pdf($documentsDir, $_FILES['file'], $nome);
            $arquivo = $uploaded['url'];
        }

        if ($arquivo === '') {
            api_respond(400, ['error' => 'Arquivo PDF obrigatório.']);
        }

        $document = [
            'id' => $id,
            'nome' => $nome,
            'categoria' => $categoria,
            'data' => $data,
            'arquivo' => $arquivo,
        ];

        if ($isUpdate && $existingIndex !== null) {
            $documents[$existingIndex] = $document;
        } else {
            $documents[] = $document;
        }

        api_respond(200, [
            'success' => true,
            'documento' => $document,
            'documentos' => save_documents($indexPath, $documents),
        ]);
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if (!$id) api_respond(400, ['error' => 'ID obrigatório.']);

        $documents = load_documents($indexPath);
        $existingIndex = find_document_index($documents, (string) $id);

        if ($existingIndex === null) {
            api_respond(404, ['error' => 'Documento não encontrado.']);
        }

        $document = $documents[$existingIndex];
        delete_document_file($documentsDir, (string) ($document['arquivo'] ?? ''));
        array_splice($documents, $existingIndex, 1);
        save_documents($indexPath, $documents);

        api_respond(200, ['success' => true]);
    }

    api_respond(405, ['error' => 'Método não permitido.']);
} catch (Throwable $error) {
    api_respond(500, ['error' => $error->getMessage()]);
}
