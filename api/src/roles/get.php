<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = [];

    try {
        $stmt = $conn->prepare("
            SELECT 
                id,
                code,
                name,
                description,
                category
            FROM permissions
            ORDER BY category ASC, name ASC
        ");

        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
