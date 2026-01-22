<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $name        = trim($_POST['name'] ?? '');
        $slug        = trim($_POST['slug'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $status      = $_POST['status'] ?? 'active';

        if ($name === '' || $slug === '') throw new Exception("Category name and slug are required");

        if (!in_array($status, ['active', 'inactive'], true)) $status = 'active';

        $baseSlug = $slug;
        $i = 1;

        while (true) {
            $check = $conn->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
            $check->execute([':slug' => $slug]);

            if ($check->rowCount() === 0) break;

            $slug = $baseSlug . "-" . $i;
            $i++;
        }

        $imagePath = null;

        if (!empty($_FILES['image']['name'])) {
            $upload = upload_pics($_FILES['image'], 5 * 1024 * 1024);
            if ($upload['error']) throw new Exception($upload['message']);
            $imagePath = $upload['path'];
        }

        $stmt = $conn->prepare("INSERT INTO categories (name, slug, description, image, status) VALUES (:name, :slug, :description, :image, :status)");

        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':slug', $slug);
        $stmt->bindValue(':description', $description);
        $stmt->bindValue(':image', $imagePath);
        $stmt->bindValue(':status', $status);
        $stmt->execute();

        $conn->commit();

        $data = ["id" => $conn->lastInsertId(), "name" => $name, "slug" => $slug, "image" => $imagePath, "status" => $status];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode(["error" => $error, "data"  => $data]);
