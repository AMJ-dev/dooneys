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

    $stmt = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE id = ? 
        AND role_id = ?
        AND role != 'customer'
    ");
    $stmt->execute([$staffId, $roleId]);

    if (!$stmt->fetchColumn()) {
        throw new Exception("User not assigned to this role or invalid user");
    }

    $stmt = $conn->prepare("
        UPDATE users 
        SET role_id = NULL 
        WHERE id = :staff_id
    ");
    $stmt->execute([
        ":staff_id" => $staffId
    ]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Removal failed");
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
