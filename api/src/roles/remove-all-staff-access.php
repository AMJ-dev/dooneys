<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $roleId = (int)($_POST["access_level_id"] ?? 0);

    if ($roleId <= 0) {
        throw new Exception("Invalid role");
    }

    $stmt = $conn->prepare("SELECT id FROM roles WHERE id = ?");
    $stmt->execute([$roleId]);
    if (!$stmt->fetchColumn()) {
        throw new Exception("Role not found");
    }

    $stmt = $conn->prepare("
        UPDATE users 
        SET role_id = NULL 
        WHERE role_id = :role_id
        AND role != 'customer'
    ");
    $stmt->execute([
        ":role_id" => $roleId
    ]);

    $data = true;

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
