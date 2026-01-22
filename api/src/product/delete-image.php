<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $id = (int)($_POST['id'] ?? 0);

        if ($id <= 0) throw new Exception("Invalid request");

        $get = $conn->prepare("SELECT image FROM product_gallery WHERE id = :id LIMIT 1");
        $get->execute([':id' => $id]);

        if ($get->rowCount() === 0) throw new Exception("Image not found");

        $image = $get->fetch(PDO::FETCH_OBJ)->image;

        $del = $conn->prepare("DELETE FROM product_gallery WHERE id = :id LIMIT 1");
        $del->execute([':id' => $id]);

        if (!empty($image)) delete_file($image);

        $conn->commit();

        $data = ["deleted" => true, "image_id" => $id];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    if ($error) http_response_code(400);

    echo json_encode(["error" => $error, "data"  => $data]);
