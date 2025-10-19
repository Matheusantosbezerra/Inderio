<?php
header('Content-Type: application/json');
include('db.php');

$data = json_decode(file_get_contents('php://input'), true);
$urlOriginal = trim($data['url'] ?? '');

if (empty($urlOriginal)) {
    echo json_encode(['erro' => 'URL inválida']);
    exit;
}

// Gera código aleatório
$codigo = substr(str_shuffle("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 6);

// Salva no banco
$stmt = $conn->prepare("INSERT INTO links (codigo, url) VALUES (?, ?)");
$stmt->bind_param("ss", $codigo, $urlOriginal);
if ($stmt->execute()) {
    $dominio = "https://" . $_SERVER['HTTP_HOST'] . "/go.php?c=" . $codigo;
    echo json_encode(['link' => $dominio]);
} else {
    echo json_encode(['erro' => 'Falha ao salvar no banco']);
}
?>
