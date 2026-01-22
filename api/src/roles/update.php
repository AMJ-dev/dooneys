<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $roleId      = intval($_POST["id"] ?? 0);
    $name        = trim($_POST["name"] ?? "");
    $description = trim($_POST["description"] ?? "");
    $permissions = $_POST["permissions"] ?? [];

    if ($roleId <= 0) {
        throw new Exception("Invalid role ID");
    }

    if ($name === "" || $description === "") {
        throw new Exception("Role name and description are required");
    }

    if (is_string($permissions)) {
        $decoded = json_decode($permissions, true);
        if (is_array($decoded)) {
            $permissions = $decoded;
        } else {
            $permissions = array_filter(array_map("trim", explode(",", $permissions)));
        }
    }

    if (!is_array($permissions) || count($permissions) === 0) {
        throw new Exception("At least one permission is required");
    }

    $slug = strtolower(preg_replace("/[^a-z0-9]+/", "-", $name));
    $slug = trim($slug, "-");

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        UPDATE roles
        SET slug = :slug, name = :name, description = :description
        WHERE id = :id
    ");

    $stmt->execute([
        ":slug" => $slug,
        ":name" => $name,
        ":description" => $description,
        ":id" => $roleId
    ]);

    $stmt = $conn->prepare("DELETE FROM role_permissions WHERE role_id = ?");
    $stmt->execute([$roleId]);

    $placeholders = implode(",", array_fill(0, count($permissions), "?"));

    $stmt = $conn->prepare("
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT ?, id
        FROM permissions
        WHERE code IN ($placeholders)
    ");

    $stmt->execute(array_merge([$roleId], $permissions));

    if ($stmt->rowCount() === 0) {
        throw new Exception("No permissions matched");
    }

    $conn->commit();

    $data = [
        "id" => $roleId,
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
