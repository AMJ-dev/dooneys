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

        $get = $conn->prepare("SELECT status FROM categories WHERE id = :id LIMIT 1");
        $get->execute([':id' => $id]);

        if ($get->rowCount() === 0) {
            throw new Exception("Category not found");
        }

        $currentStatus = $get->fetch(PDO::FETCH_OBJ)->status;
        $newStatus = $currentStatus === 'active' ? 'inactive' : 'active';

        $upd = $conn->prepare("UPDATE categories SET status = :status WHERE id = :id LIMIT 1");
        $upd->execute([':status' => $newStatus, ':id' => $id]);

        $conn->commit();

        $data = ["id" => $id, "status" => $newStatus];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    if ($error) {
        http_response_code(400);
    }

    echo json_encode(["error" => $error, "data" => $data]);
