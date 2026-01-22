<?php
    require_once __DIR__ . "/include/set-header.php";

    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    $conn->exec("TRUNCATE TABLE permissions");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    $permissions = [
        // Analytics
        ["view_analytics","View Analytics","Access analytics dashboard and reports","TrendingUp","Analytics"],
        ["export_reports","Export Reports","Export analytics data","BarChart3","Analytics"],

        // Orders
        ["view_orders","View Orders","View all customer orders","ShoppingBag","Orders"],
        ["process_orders","Process Orders","Process and update order status","ShoppingBag","Orders"],

        // Discount
        ["view_discount","View Discount","View all discounts","Percent","Discount"],
        ["add_discount","Add Discount","Create discounts","Plus","Discount"],
        ["edit_discount","Edit Discount","Edit discounts","Percent","Discount"],
        ["delete_discount","Delete Discount","Delete discounts","Trash2","Discount"],
        ["deactivate_discount","Deactivate Discount","Deactivate discounts","Lock","Discount"],

        // Products
        ["view_products","View Products","View products","Package","Products"],
        ["add_product","Add Product","Add products","Plus","Products"],
        ["edit_product","Edit Product","Edit products","Package","Products"],
        ["delete_product","Delete Product","Delete products","Trash2","Products"],

        // Categories
        ["view_categories","View Categories","View categories","Folder","Categories"],
        ["add_category","Add Category","Add categories","Plus","Categories"],
        ["edit_category","Edit Category","Edit categories","Folder","Categories"],
        ["delete_category","Delete Category","Delete categories","Trash2","Categories"],
        ["activate_deactivate_categories","Activate/Deactivate Categories","Toggle categories","Lock","Categories"],

        // Inventory
        ["view_inventory","View Inventory","View inventory","Box","Inventory"],
        ["adjust_inventory","Adjust Inventory","Adjust inventory","Layers","Inventory"],

        // Customers
        ["view_customers","View Customers","View customers","Users","Customers"],
        ["delete_customer","Delete Customer","Delete customers","Trash2","Customers"],
        ["activate_deactivate_customer","Activate/Deactivate Customer","Toggle customers","UserX","Customers"],

        // Staff
        ["view_staff","View Staff","View staff","Users","Staff"],
        ["add_staff","Add Staff","Add staff","UserPlus","Staff"],
        ["edit_staff","Edit Staff","Edit staff","UserCheck","Staff"],
        ["delete_staff","Delete Staff","Delete staff","Trash2","Staff"],
        ["activate_deactivate_staff","Activate/Deactivate Staff","Toggle staff","Lock","Staff"],
        ["assign_roles","Assign Roles","Assign roles","ShieldAlert","Staff"],

        // Pickup Location
        ["view_pickup_location","View Pickup Location","View pickup locations","MapPin","Pickup Location"],
        ["add_pickup_location","Add Pickup Location","Add pickup locations","Plus","Pickup Location"],
        ["edit_pickup_location","Edit Pickup Location","Edit pickup locations","MapPin","Pickup Location"],
        ["delete_pickup_location","Delete Pickup Location","Delete pickup locations","Trash2","Pickup Location"],
        ["activate_deactivate_pickup_location","Activate/Deactivate Pickup Location","Toggle pickup locations","Lock","Pickup Location"],

        // Roles
        ["view_roles","View Roles","View roles","Shield","Roles (Access Control)"],
        ["add_role","Add Role","Add roles","Plus","Roles (Access Control)"],
        ["edit_role","Edit Role","Edit roles","Shield","Roles (Access Control)"],
        ["delete_role","Delete Role","Delete roles","Trash2","Roles (Access Control)"],
        ["assign_users","Assign Users","Assign users","Users","Roles (Access Control)"],

        // Settings
        ["manage_settings","Manage Settings","Manage settings","Settings","Settings"],
    ];

    $stmt = $conn->prepare("
        INSERT INTO permissions (code, name, description, icon, category)
        VALUES (:code, :name, :description, :icon, :category)
    ");

    foreach ($permissions as $p) {
        $stmt->execute([
            ":code" => $p[0],
            ":name" => $p[1],
            ":description" => $p[2],
            ":icon" => $p[3],
            ":category" => $p[4],
        ]);
    }

    echo json_encode([
        "error" => false,
        "message" => "Permissions reseeded with icons",
        "count" => count($permissions)
    ]);
