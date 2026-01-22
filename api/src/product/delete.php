<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) {
            throw new Exception("Invalid request");
        }

        $check = $conn->prepare("SELECT id FROM products WHERE id = :id LIMIT 1");
        $check->execute([':id' => $id]);
        if ($check->rowCount() === 0) {
            throw new Exception("Product not found");
        }

        $stmt = $conn->prepare("SELECT image FROM product_gallery WHERE product_id = :id");
        $stmt->execute([':id' => $id]);
        $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $conn->prepare("DELETE FROM product_gallery WHERE product_id = :id")
            ->execute([':id' => $id]);

        $conn->prepare("DELETE FROM products WHERE id = :id LIMIT 1")
            ->execute([':id' => $id]);

        foreach ($images as $img) {
            if ($img) {
                delete_file($img);
            }
        }

        $conn->commit();
        $data = ["deleted" => true, "id" => $id];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    if ($error) {
        http_response_code(400);
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
