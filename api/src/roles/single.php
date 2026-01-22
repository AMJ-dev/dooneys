<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $roleId = intval($_GET["id"] ?? 0);

    if ($roleId <= 0) {
        throw new Exception("Invalid role ID");
    }

    $stmt = $conn->prepare("
        SELECT 
            id,
            name,
            description
        FROM roles
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$roleId]);
    $role = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$role) {
        throw new Exception("Role not found");
    }

    $stmt = $conn->prepare("
        SELECT p.code
        FROM role_permissions rp
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = ?
    ");
    $stmt->execute([$roleId]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $data = [
        "id"          => (string)$role["id"],
        "name"        => $role["name"],
        "description" => $role["description"],
        "permissions" => $permissions
    ];

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
