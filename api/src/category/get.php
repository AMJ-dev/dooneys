<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = [];

try {

    /* ================= MAIN CATEGORY ANALYTICS ================= */
    $sql = "
        SELECT
            c.id,
            c.name,
            c.slug,
            c.description,
            c.image,
            c.status,

            COUNT(DISTINCT p.id) AS product_count,

            COALESCE(SUM(
                CASE
                    WHEN pay.status = 'paid'
                    THEN oi.total_price
                    ELSE 0
                END
            ), 0) AS total_revenue,

            COUNT(DISTINCT CASE
                WHEN pay.status = 'paid'
                THEN o.id
            END) AS orders_count,

            COUNT(DISTINCT ev.id) AS views,

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

        LEFT JOIN products p ON p.category_id = c.id
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id
        LEFT JOIN payments pay ON pay.order_id = o.id
        LEFT JOIN events ev ON ev.event = 'view_product' AND ev.entity_id = p.id

        GROUP BY c.id
        ORDER BY c.created_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$categories) {
        echo json_encode(["error" => false, "data" => []]);
        exit;
    }

    /* ================= FETCH ALL SUBCATEGORIES ================= */
    $subStmt = $conn->prepare("
        SELECT id, category_id, name, slug, status
        FROM sub_categories
        ORDER BY name ASC
    ");
    $subStmt->execute();
    $subs = $subStmt->fetchAll(PDO::FETCH_ASSOC);

    /* ================= GROUP SUBCATEGORIES BY CATEGORY ================= */
    $subMap = [];

    foreach ($subs as $sub) {
        $subMap[$sub['category_id']][] = $sub;
    }

    /* ================= ATTACH TO CATEGORY ================= */
    foreach ($categories as &$cat) {
        $cat['sub_categories'] = $subMap[$cat['id']] ?? [];
    }

    $data = $categories;

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
