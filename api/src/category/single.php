<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = null;

    try {
        $id = (int)($_GET['id'] ?? 0);

        if ($id <= 0) throw new Exception("Invalid request");

        $stmt = $conn->prepare("SELECT id, name, slug, description, image, status FROM categories WHERE id = :id LIMIT 1");

        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) throw new Exception("Category not found");
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data,
    ]);
