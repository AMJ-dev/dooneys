<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = [];

try {
    $stmt = $conn->prepare("
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.pics,
            u.email,
            u.mobile_number,
            u.role,
            CASE
                WHEN u.status = '1' THEN 'active'
                WHEN u.status = '2' THEN 'suspended'
                WHEN u.status = '0' THEN 'pending'
                ELSE 'inactive'
            END AS status,
            u.created_at AS joined_date,
            COUNT(o.id) AS total_orders,
            COALESCE(SUM(o.total_amount), 0) AS total_spent,
            u.last_login
        FROM users u
        LEFT JOIN orders o
            ON o.user_id = u.id
            AND o.payment_status = 'paid'
        WHERE u.role = 'customer'
        GROUP BY
            u.id,
            u.first_name,
            u.last_name,
            u.pics,
            u.email,
            u.mobile_number,
            u.role,
            u.status,
            u.created_at,
            u.last_login
        ORDER BY u.created_at DESC
    ");

    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);

