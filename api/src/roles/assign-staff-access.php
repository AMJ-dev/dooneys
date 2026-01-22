<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $roleId  = (int)($_POST["access_level_id"] ?? 0);
    $staffId = (int)($_POST["staff_id"] ?? 0);

    if ($roleId <= 0 || $staffId <= 0) {
        throw new Exception("Invalid parameters");
    }

    $stmt = $conn->prepare("SELECT id FROM roles WHERE id = ?");
    $stmt->execute([$roleId]);
    if (!$stmt->fetchColumn()) {
        throw new Exception("Role not found");
    }

    $stmt = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE id = ? 
        AND role != 'customer'
    ");
    $stmt->execute([$staffId]);
    if (!$stmt->fetchColumn()) {
        throw new Exception("User not found or is a customer");
    }

    $stmt = $conn->prepare("
        UPDATE users 
        SET role_id = :role_id 
        WHERE id = :staff_id
    ");
    $stmt->execute([
        ":role_id"  => $roleId,
        ":staff_id" => $staffId
    ]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Assignment failed");
    }

    $data = true;

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
