<?php
session_start();
require_once 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nip = $_POST['nip'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($nip) || empty($password)) {
        header("Location: login.php?error=empty_fields");
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, nip, nama_lengkap, password, role, id_kabupaten FROM users WHERE nip = :nip LIMIT 1");
        $stmt->bindParam(':nip', $nip, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Valid login
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['id_kabupaten'] = $user['id_kabupaten'];

            // Regenerate session ID to prevent session fixation
            session_regenerate_id(true);

            header("Location: dashboard.php");
            exit;
        } else {
            // Invalid credentials
            header("Location: login.php?error=invalid_credentials");
            exit;
        }
    } catch(PDOException $e) {
        // Log the error in a real app
        header("Location: login.php?error=server_error");
        exit;
    }
} else {
    header("Location: login.php");
    exit;
}
?>
