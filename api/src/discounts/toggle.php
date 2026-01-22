<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";
require_once dirname(__DIR__, 2) . "/include/set-header.php";

$error = false;
$data  = null;

try {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) {
        throw new Exception("Invalid discount ID");
    }

    $stmt = $conn->prepare("
        SELECT is_active
        FROM discounts
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $discount = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$discount) {
        throw new Exception("Discount not found");
    }

    $newActive = $discount['is_active'] ? 0 : 1;
    $newStatus = $newActive ? 'active' : 'disabled';

    $stmt = $conn->prepare("
        UPDATE discounts
        SET
            is_active = :is_active,
            status = :status,
            updated_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute([
        ':is_active' => $newActive,
        ':status'    => $newStatus,
        ':id'        => $id
    ]);

    $data = [
        "id"        => $id,
        "is_active" => (bool)$newActive,
        "status"    => $newStatus
    ];

} catch (Throwable $e) {
    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
