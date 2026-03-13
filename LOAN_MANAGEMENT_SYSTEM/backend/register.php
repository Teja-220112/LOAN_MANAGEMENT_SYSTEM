<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // For demo, just redirect to login
    // In real app, process registration
    header('Location: ../login.html?registered=1');
    exit();
} else {
    header('Location: ../register.html');
    exit();
}
?>