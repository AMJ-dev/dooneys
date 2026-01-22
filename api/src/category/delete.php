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

        $check = $conn->prepare("
            SELECT image FROM categories WHERE id = :id LIMIT 1
        ");
        $check->execute([':id' => $id]);
        $category = $check->fetch(PDO::FETCH_OBJ);

        if (!$category) {
            throw new Exception("Category not found");
        }

        $used = $conn->prepare("
            SELECT 1 FROM products WHERE category_id = :id LIMIT 1
        ");
        $used->execute([':id' => $id]);
        if ($used->fetch()) {
            throw new Exception("Category is in use by products");
        }

        $conn->prepare("
            DELETE FROM categories WHERE id = :id LIMIT 1
        ")->execute([':id' => $id]);

        if (!empty($category->image)) {
            delete_file($category->image);
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
