<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $conn->beginTransaction();

    $id                    = (int)($_POST['id'] ?? 0);
    $name                  = trim($_POST['name'] ?? '');
    $description           = trim($_POST['description'] ?? '');
    $code                  = strtoupper(trim($_POST['code'] ?? ''));
    $discount_type          = $_POST['discount_type'] ?? 'percentage';
    $discount_value         = (float)($_POST['discount_value'] ?? 0);
    $max_discount_amount    = $_POST['max_discount_amount'] ?? null;
    $min_purchase_amount    = $_POST['min_purchase_amount'] ?? null;
    $usage_limit            = $_POST['usage_limit'] ?? null;
    $usage_per_customer     = $_POST['usage_per_customer'] ?? 1;
    $start_date             = $_POST['start_date'] ?: null;
    $end_date               = $_POST['end_date'] ?: null;
    $is_active              = (int)($_POST['is_active'] ?? 1);

    if ($id <= 0 || !$name || !$code) {
        throw new Exception("Invalid or missing required fields");
    }

    $stmt = $conn->prepare("
        SELECT id FROM discounts
        WHERE code = :code AND id != :id
        LIMIT 1
    ");
    $stmt->execute([
        ':code' => $code,
        ':id'   => $id
    ]);
    if ($stmt->fetch()) {
        throw new Exception("Discount code already exists");
    }

    $stmt = $conn->prepare("
        UPDATE discounts SET
            name = :name,
            description = :description,
            code = :code,
            discount_type = :discount_type,
            discount_value = :discount_value,
            max_discount_amount = :max_discount_amount,
            min_purchase_amount = :min_purchase_amount,
            usage_limit = :usage_limit,
            usage_per_customer = :usage_per_customer,
            start_date = :start_date,
            end_date = :end_date,
            is_active = :is_active
        WHERE id = :id
        LIMIT 1
    ");

    $stmt->execute([
        ':name'                 => $name,
        ':description'          => $description,
        ':code'                 => $code,
        ':discount_type'        => $discount_type,
        ':discount_value'       => $discount_value,
        ':max_discount_amount'  => $max_discount_amount,
        ':min_purchase_amount'  => $min_purchase_amount,
        ':usage_limit'          => $usage_limit,
        ':usage_per_customer'   => $usage_per_customer,
        ':start_date'           => $start_date,
        ':end_date'             => $end_date,
        ':is_active'            => $is_active,
        ':id'                   => $id
    ]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Discount not found or no changes made");
    }

    $conn->commit();

    $data = [
        "updated" => true,
        "discount_id" => $id
    ];

} catch (Throwable $e) {
    $conn->rollBack();
    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
