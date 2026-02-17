<?php
require_once dirname(__DIR__, 2) . "/include/set-header.php";

$error = false;
$data  = null;

try {
    $id = (int)($_GET['id'] ?? 0);

    if ($id <= 0) {
        throw new Exception("Invalid request");
    }

    $stmt = $conn->prepare("
        SELECT id, name, slug, description, image, status
        FROM categories
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Category not found");
    }

    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    $subStmt = $conn->prepare("
        SELECT id, name, slug, status
        FROM sub_categories
        WHERE category_id = :category_id
        ORDER BY name ASC
    ");
    $subStmt->execute([':category_id' => $id]);

    $subCategories = $subStmt->fetchAll(PDO::FETCH_ASSOC);

    $category['sub_categories'] = $subCategories;

    $data = $category;

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data,
]);
