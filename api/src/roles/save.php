<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $name        = trim($_POST["name"] ?? "");
    $description = trim($_POST["description"] ?? "");
    $permissions = $_POST["permissions"] ?? [];

    if ($name === "" || $description === "") {
        throw new Exception("Role name and description are required");
    }

    if (!is_array($permissions) || count($permissions) === 0) {
        throw new Exception("At least one permission is required");
    }

    $slug = strtolower(preg_replace("/[^a-z0-9]+/", "-", $name));
    $slug = trim($slug, "-");

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        INSERT INTO roles (slug, name, description)
        VALUES (:slug, :name, :description)
    ");

    $stmt->execute([
        ":slug"        => $slug,
        ":name"        => $name,
        ":description" => $description
    ]);

    $roleId = $conn->lastInsertId();

    $placeholders = implode(",", array_fill(0, count($permissions), "?"));

    $stmt = $conn->prepare("
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT ?, id
        FROM permissions
        WHERE code IN ($placeholders)
    ");

    $stmt->execute(array_merge([$roleId], $permissions));

    $conn->commit();

    $data = [
        "id"   => $roleId,
        "name" => $name,
        "slug" => $slug
    ];

} catch (Throwable $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
