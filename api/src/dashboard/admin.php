<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data = [
        "dashboard_stats" => [],
        "recent_orders" => [],
        "recent_logins" => [],
        "pending_tasks" => []
    ];

    try {
        $stmt = $conn->prepare("
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COUNT(*) as total_orders
            FROM orders 
            WHERE payment_status = 'paid'
        ");
        $stmt->execute();
        $order_stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT COUNT(DISTINCT user_id) as total_customers FROM orders WHERE user_id > 0");
        $stmt->execute();
        $customer_stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT COUNT(*) as total_products FROM products WHERE status = 'active'");
        $stmt->execute();
        $product_stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT COUNT(*) as total_staff FROM users WHERE role_id IN (2,3)");
        $stmt->execute();
        $staff_stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT COUNT(*) as out_of_stock_items FROM products WHERE stock_quantity = 0 AND status = 'active'");
        $stmt->execute();
        $out_of_stock = $stmt->fetchColumn();

        $stmt = $conn->prepare("
            SELECT COUNT(*) 
            FROM users 
            WHERE created_at >= CURDATE() - INTERVAL 7 DAY 
            AND role_id NOT IN (1,2,3)
        ");
        $stmt->execute();
        $new_customers_week = $stmt->fetchColumn();

        $data['dashboard_stats'] = [
            'totalRevenue' => (float)$order_stats['total_revenue'],
            'totalOrders' => (int)$order_stats['total_orders'],
            'totalCustomers' => (int)$customer_stats['total_customers'],
            'totalProducts' => (int)$product_stats['total_products'],
            'totalStaff' => (int)$staff_stats['total_staff'],
            'outOfStockItems' => (int)$out_of_stock,
            'newCustomersThisWeek' => (int)$new_customers_week
        ];

        $stmt = $conn->prepare("
            SELECT 
                o.order_number as id,
                o.order_source,
                o.user_id,
                o.created_by_admin_id,
                u.first_name as user_first,
                u.last_name as user_last,
                s.first_name as staff_first,
                s.last_name as staff_last,
                o.total_amount as total,
                o.order_status as status,
                DATE(o.created_at) as date,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id AND o.order_source = 'checkout'
            LEFT JOIN users s ON o.created_by_admin_id = s.id AND o.order_source = 'pos'
            ORDER BY o.created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted_orders = [];
        foreach ($orders as $order) {
            if ($order['order_source'] === 'checkout') {
                $customer = trim($order['user_first'] . ' ' . $order['user_last']);
                $source_label = "Website Checkout";
            } elseif ($order['order_source'] === 'pos') {
                $customer = trim($order['staff_first'] . ' ' . $order['staff_last']) . " (Staff)";
                $source_label = "In-Store POS";
            } else {
                $customer = "Guest / Unknown";
                $source_label = "Admin Order";
            }

            $formatted_orders[] = [
                'id' => $order['id'],
                'customer' => $customer,
                'source_label' => $source_label,
                'total' => (float)$order['total'],
                'status' => $order['status'],
                'date' => $order['date'],
                'items' => (int)$order['items']
            ];
        }
        $data['recent_orders'] = $formatted_orders;

        $stmt = $conn->prepare("
            SELECT 
                ip_address,
                device_type,
                browser,
                platform,
                DATE_FORMAT(created_at, '%Y-%m-%d %h:%i %p') as created_at
            FROM login_history 
            ORDER BY created_at DESC
            LIMIT 4
        ");
        $stmt->execute();
        $data['recent_logins'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT COUNT(*) FROM orders WHERE order_status = 'processing'");
        $stmt->execute();
        $pending_shipments = $stmt->fetchColumn();

        $stmt = $conn->prepare("
            SELECT COUNT(*) 
            FROM products 
            WHERE stock_quantity <= low_stock_alert 
            AND stock_quantity > 0 
            AND status = 'active'
        ");
        $stmt->execute();
        $low_stock_items = $stmt->fetchColumn();

        $data['pending_tasks'] = [
            'pendingShipments' => (int)$pending_shipments,
            'lowStockItems' => (int)$low_stock_items,
            'outOfStockItems' => (int)$out_of_stock
        ];

    } catch (Throwable $e) {
        $error = true;
        $data = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ], JSON_NUMERIC_CHECK);