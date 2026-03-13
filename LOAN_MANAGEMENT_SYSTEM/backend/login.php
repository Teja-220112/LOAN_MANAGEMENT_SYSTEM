<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';

    // For demo purposes, simple check
    // In real app, validate against database
    if (!empty($email) && !empty($password) && !empty($role)) {
        if ($role == 'admin') {
            header('Location: ../admin-panel/dashboard.html');
            exit();
        } elseif ($role == 'customer') {
            header('Location: ../user-pages/dashboard.html');
            exit();
        } else {
            header('Location: login.html?error=invalid_role');
            exit();
        }
    } else {
        header('Location: login.html?error=missing_fields');
        exit();
    }
} else {
    header('Location: login.html');
    exit();
}
?>