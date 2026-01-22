<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = [];

    try {
        $stmt = $conn->prepare("SELECT c.id, c.name, c.slug, c.description, c.image, c.status, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.created_at DESC");

        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode(["error" => $error, "data" => $data]);
