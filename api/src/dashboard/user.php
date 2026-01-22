<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data = [];

    try {
        
    } catch (Throwable $e) {
        $error = true;
        $data = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ]);
