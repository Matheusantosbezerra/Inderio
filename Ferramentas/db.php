<?php
$host = "108.167.188.140";       // ou IP do seu servidor
$user = "math3376_matheus";
$pass = "071de089fe@!";
$dbname = "math3376_flights_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
