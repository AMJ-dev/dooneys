<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = [];

    try {

        $stmt = $conn->prepare("
            SELECT
                COUNT(*) AS total_products,

                SUM(
                    CASE
                        WHEN p.manage_stock = 1
                        THEN p.price * p.stock_quantity
                        ELSE 0
                    END
                ) AS stock_value,

                AVG(p.price) AS avg_price,

                SUM(CASE WHEN p.is_new = 1 THEN 1 ELSE 0 END) AS new_products,

                SUM(CASE WHEN p.is_best_seller = 1 THEN 1 ELSE 0 END) AS best_sellers,

                SUM(
                    CASE
                        WHEN p.is_best_seller = 1 OR p.is_new = 1
                        THEN 1 ELSE 0
                    END
                ) AS featured_products,

                ROUND(
                    (
                        SUM(
                            CASE
                                WHEN p.is_best_seller = 1 OR p.is_new = 1
                                THEN 1 ELSE 0
                            END
                        ) / COUNT(*)
                    ) * 100,
                    2
                ) AS featured_percentage,

                SUM(
                    CASE
                        WHEN p.manage_stock = 1
                        AND p.stock_quantity <= p.low_stock_alert
                        THEN 1 ELSE 0
                    END
                ) AS low_stock_products

            FROM products p
        ");

        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
