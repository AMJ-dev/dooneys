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
            d.max_discount_amount,
            d.min_purchase_amount,
            d.apply_to,
            d.customer_eligibility,
            d.target_platform,
            d.start_date,
            d.end_date,
            d.status,
            d.is_active,
            d.total_used,
            d.total_users,
            d.estimated_savings,
            d.usage_limit,
            d.usage_per_customer,
            d.created_at,
            d.updated_at,

            CASE
                WHEN d.is_active = 0 THEN 'disabled'
                WHEN d.end_date IS NOT NULL AND d.end_date < CURDATE() THEN 'expired'
                WHEN d.start_date IS NOT NULL AND d.start_date > CURDATE() THEN 'scheduled'
                ELSE 'active'
            END AS computed_status

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
