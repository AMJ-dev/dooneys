<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data = [];

    try {
        $query = trim($_POST['query'] ?? '');

        if (empty($query)) {
            echo json_encode(["error" => false, "data" => []]);
            exit;
        }

        $searchTerm = preg_replace('/[^a-zA-Z0-9\s\-]/', '', $query);
        if (strlen($searchTerm) < 2) {
            echo json_encode(["error" => false, "data" => []]);
            exit;
        }

        $escapedSearch = str_replace(['%', '_'], ['\%', '\_'], $searchTerm);
        $likePattern = '%' . $escapedSearch . '%';

        $stmt = $conn->prepare("
            SELECT 
                'product' as type,
                p.id,
                p.name,
                p.price,
                c.name as category_name,
                COALESCE(pg.image, 'placeholder-product.png') as image
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN (
                SELECT product_id, MIN(image) as image
                FROM product_gallery
                GROUP BY product_id
            ) pg ON pg.product_id = p.id
            WHERE p.status = 'active'
            AND (
                p.name LIKE ?
                OR p.description LIKE ?
                OR c.name LIKE ?
            )
            ORDER BY p.is_best_seller DESC, p.created_at DESC
            LIMIT 8
        ");
        
        $stmt->execute([$likePattern, $likePattern, $likePattern]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $categories = [];
        if (count($products) < 5 || strlen($searchTerm) <= 3) {
            $stmt = $conn->prepare("
                SELECT 
                    'category' as type,
                    c.id,
                    c.name
                FROM categories c
                WHERE c.name LIKE ?
                ORDER BY c.name
                LIMIT 3
            ");
            $stmt->execute([$likePattern]);
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $results = array_merge($products, $categories);
        
        $seen = [];
        $uniqueResults = [];
        foreach ($results as $item) {
            $key = $item['type'] . '_' . strtolower($item['name']);
            if (!in_array($key, $seen)) {
                $seen[] = $key;
                $uniqueResults[] = $item;
            }
        }

        echo json_encode([
            "error" => false,
            "data" => array_slice($uniqueResults, 0, 10)
        ], JSON_NUMERIC_CHECK);

    } catch (Throwable $e) {
        echo json_encode([
            "error" => true,
            "data" => $e->getMessage()
        ]);
    }