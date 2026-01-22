<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = [
    "inventory" => [],
    "stats" => null,
    "top_selling" => [],
    "categories_distribution" => []
];

try {

    $stmt = $conn->prepare("
        SELECT
            p.id,
            p.name,
            p.description,
            p.category_id,
            c.name AS category_name,
            p.price,
            p.original_price,
            p.sku,
            p.status,
            p.is_best_seller,
            p.is_new,
            p.in_stock,
            p.manage_stock,
            p.stock_quantity,
            p.low_stock_alert,
            p.weight,
            p.item_width,
            p.item_height,
            p.item_depth,
            p.created_at,
            p.updated_at
        FROM products p
        INNER JOIN categories c ON c.id = p.category_id
        ORDER BY p.name ASC
    ");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $productIds = array_column($products, 'id');
    $imageMap = [];

    if ($productIds) {
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $imgStmt = $conn->prepare("
            SELECT product_id, image
            FROM product_gallery
            ORDER BY sort_order ASC, id ASC
        ");
        $imgStmt->execute();
        foreach ($imgStmt->fetchAll(PDO::FETCH_ASSOC) as $img) {
            if (!isset($imageMap[$img['product_id']])) {
                $imageMap[$img['product_id']] = $img['image'];
            }
        }
    }

    $totalProducts = count($products);
    $totalStockValue = 0;
    $totalStockUnits = 0;
    $inStock = 0;
    $lowStock = 0;
    $outOfStock = 0;

    $healthCount = [
        "healthy" => 0,
        "warning" => 0,
        "critical" => 0
    ];

    foreach ($products as $p) {

        if ($p["stock_quantity"] == 0) {
            $stockStatus = "out_of_stock";
            $stockHealth = "critical";
            $outOfStock++;
        } elseif ($p["stock_quantity"] <= $p["low_stock_alert"]) {
            $stockStatus = "low_stock";
            $stockHealth = "critical";
            $lowStock++;
        } elseif ($p["stock_quantity"] <= ($p["low_stock_alert"] * 2)) {
            $stockStatus = "in_stock";
            $stockHealth = "warning";
            $inStock++;
        } else {
            $stockStatus = "in_stock";
            $stockHealth = "healthy";
            $inStock++;
        }

        $healthCount[$stockHealth]++;

        $stockValue = $p["manage_stock"]
            ? ($p["price"] * $p["stock_quantity"])
            : 0;

        $totalStockValue += $stockValue;
        $totalStockUnits += $p["stock_quantity"];

        $data["inventory"][] = [
            "id" => (int)$p["id"],
            "name" => $p["name"],
            "description" => $p["description"],
            "category_id" => (int)$p["category_id"],
            "category_name" => $p["category_name"],
            "price" => (float)$p["price"],
            "original_price" => $p["original_price"] ? (float)$p["original_price"] : null,
            "sku" => $p["sku"],
            "status" => $p["status"],
            "is_best_seller" => (bool)$p["is_best_seller"],
            "is_new" => (bool)$p["is_new"],
            "in_stock" => (bool)$p["in_stock"],
            "manage_stock" => (bool)$p["manage_stock"],
            "stock_quantity" => (int)$p["stock_quantity"],
            "low_stock_alert" => (int)$p["low_stock_alert"],
            "stock_status" => $stockStatus,
            "stock_health" => $stockHealth,
            "stock_value" => $stockValue,
            "reorder_quantity" => max(10, $p["low_stock_alert"] * 2),
            "sold_last_30_days" => 0,
            "total_ordered" => 0,
            "average_monthly_sales" => 0,
            "months_coverage" => 0,
            "supplier" => "Default Supplier",
            "lead_time_days" => 7,
            "created_at" => $p["created_at"],
            "updated_at" => $p["updated_at"],
            "last_restocked" => substr($p["updated_at"], 0, 10),
            "image" => $imageMap[$p["id"]] ?? null,
            "needs_reorder" => ($stockHealth === "critical")
        ];
    }

    $data["stats"] = [
        "total_products" => $totalProducts,
        "total_stock_value" => $totalStockValue,
        "total_stock_units" => $totalStockUnits,
        "in_stock_items" => $inStock,
        "low_stock_items" => $lowStock,
        "out_of_stock_items" => $outOfStock,
        "total_sold_last_month" => 0,
        "total_revenue_last_month" => 0,
        "attention_items" => $healthCount["critical"],
        "turnover_rate" => 0,
        "average_stock_coverage" => 0,
        "stock_health" => $healthCount
    ];

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data" => $data
]);
