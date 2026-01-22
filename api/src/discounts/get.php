<?php
require_once dirname(__DIR__, 2) . "/include/set-header.php";

$error = false;
$data  = [];

try {

    $stmt = $conn->prepare("
        SELECT
            d.id,
            d.name,
            d.code,
            d.discount_type,
            d.discount_value,
            d.min_purchase_amount,
            d.usage_limit,
            d.usage_per_customer,
            d.start_date,
            d.end_date,
            d.is_active,
            d.total_used,
            d.total_users,
            d.estimated_savings,

            CASE
                WHEN d.is_active = 0 THEN 'disabled'
                WHEN d.start_date IS NOT NULL AND d.start_date > CURDATE() THEN 'scheduled'
                WHEN d.end_date IS NOT NULL AND d.end_date < CURDATE() THEN 'expired'
                ELSE 'active'
            END AS status

        FROM discounts d
        ORDER BY d.created_at DESC
    ");
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (Throwable $e) {
    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
