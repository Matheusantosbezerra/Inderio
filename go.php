<?php
include('Ferramentas/db.php');

if (!isset($_GET['c'])) {
    die("Código inválido.");
}

$codigo = $_GET['c'];

// Busca o link no banco
$stmt = $conn->prepare("SELECT url, clicks FROM links WHERE codigo = ?");
$stmt->bind_param("s", $codigo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $dados = $result->fetch_assoc();
    $novaContagem = $dados['clicks'] + 1;

    // Atualiza contador
    $update = $conn->prepare("UPDATE links SET clicks = ? WHERE codigo = ?");
    $update->bind_param("is", $novaContagem, $codigo);
    $update->execute();

    // Redireciona
    header("Location: " . $dados['url']);
    exit;
} else {
    echo "❌ Link não encontrado.";
}
?>
