<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = [];

try {

    $sql = "
        SELECT
            c.id,
            c.name,
            c.slug,
            c.description,
            c.image,
            c.status,

            COUNT(DISTINCT p.id) AS product_count,

            /* Revenue from PAID payments only */
            COALESCE(SUM(
                CASE
                    WHEN pay.status = 'paid'
                    THEN oi.total_price
                    ELSE 0
                END
            ), 0) AS total_revenue,

            /* Orders with successful payment */
            COUNT(DISTINCT CASE
                WHEN pay.status = 'paid'
                THEN o.id
            END) AS orders_count,

            /* Product views */
            COUNT(DISTINCT ev.id) AS views,

            /* Conversion rate */
            CASE
                WHEN COUNT(DISTINCT ev.id) = 0 THEN 0
                ELSE ROUND(
                    (
                        COUNT(DISTINCT CASE WHEN pay.status = 'paid' THEN o.id END)
                        / COUNT(DISTINCT ev.id)
                    ) * 100,
                    2
                )
            END AS conversion_rate

        FROM categories c

        LEFT JOIN products p
            ON p.category_id = c.id

        LEFT JOIN order_items oi
            ON oi.product_id = p.id

        LEFT JOIN orders o
            ON o.id = oi.order_id

        /* PAYMENT is the source of truth */
        LEFT JOIN payments pay
            ON pay.order_id = o.id

        /* Product views */
        LEFT JOIN events ev
            ON ev.event = 'view_product'
            AND ev.entity_id = p.id

        GROUP BY c.id
        ORDER BY c.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
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
