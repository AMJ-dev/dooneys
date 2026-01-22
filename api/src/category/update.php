<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $id          = (int)($_POST['id'] ?? 0);
        $name        = trim($_POST['name'] ?? '');
        $slug        = trim($_POST['slug'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $status      = $_POST['status'] ?? 'active';

        if ($id <= 0 || $name === '' || $slug === '') throw new Exception("Invalid request");
        if (!in_array($status, ['active', 'inactive'], true)) $status = 'active';

        $get = $conn->prepare("SELECT image FROM categories WHERE id = :id LIMIT 1");
        $get->execute([':id' => $id]);

        if ($get->rowCount() === 0) throw new Exception("Category not found");

        $oldImage = $get->fetch(PDO::FETCH_OBJ)->image;

        $baseSlug = $slug;
        $i = 1;

        while (true) {
            $check = $conn->prepare("SELECT id FROM categories WHERE slug = :slug AND id != :id LIMIT 1");
            $check->execute([':slug' => $slug, ':id' => $id]);

            if ($check->rowCount() === 0) break;

            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        $imagePath = $oldImage;

        if (!empty($_FILES['image']['name'])) {
            $upload = upload_pics($_FILES['image'], 5 * 1024 * 1024);

            if ($upload['error']) throw new Exception($upload['message']);
            $imagePath = $upload['path'];
            if (!empty($oldImage)) delete_file($oldImage);
        }

        $stmt = $conn->prepare("UPDATE categories SET name = :name, slug = :slug, description = :description, image = :image, status = :status WHERE id = :id LIMIT 1");

        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':slug', $slug);
        $stmt->bindValue(':description', $description);
        $stmt->bindValue(':image', $imagePath);
        $stmt->bindValue(':status', $status);
        $stmt->bindValue(':id', $id);
        $stmt->execute();

        $conn->commit();

        $data = ["id" => $id, "name" => $name, "slug" => $slug, "image" => $imagePath, "status" => $status];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode(["error" => $error, "data" => $data]);
