<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $roleId = intval($_POST["access_level_id"] ?? 0);

    if ($roleId <= 0) {
        throw new Exception("Invalid role ID");
    }

    if ($roleId === 1) {
        throw new Exception("This role cannot be deleted");
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare("UPDATE users SET role_id = NULL WHERE role_id = ?");
    $stmt->execute([$roleId]);

    $stmt = $conn->prepare("DELETE FROM roles WHERE id = ?");
    $stmt->execute([$roleId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Role not found");
    }

    $conn->commit();

    $data = "Role deleted successfully";

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
