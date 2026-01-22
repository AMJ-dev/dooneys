<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = null;

    try {

        $stmt = $conn->prepare("
            SELECT
                id,
                store_gst,
                store_free_shipping,
                store_free_shipping_threshold,

                -- Stripe
                stripe_secret_key,
                stripe_publishable_key,

                -- Canada Post
                canadapost_customer_number,
                canadapost_username,
                canadapost_password,

                -- FedEx
                fedex_client_id,
                fedex_client_secret,
                fedex_account_number,

                -- Shipment Origin
                shipment_postal_code,
                shipment_city,
                shipment_province,
                shipment_country,

                -- DHL
                dhl_account_number,
                dhl_api_key,

                -- Notifications
                new_order_notification,
                order_status_notification,
                order_cancel_notification,
                high_value_order_notification,
                low_stock_notification,
                out_of_stock_notification,
                new_customer_notification,
                support_request_notification,
                product_review_notification,

                updated_at
            FROM store_settings
            LIMIT 1
        ");
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception("Store settings not found");
        }

        // Cast booleans and numeric types properly for frontend
        $data = [
            "id" => (string)$row["id"],
            "store_gst" => $row["store_gst"],
            "store_free_shipping" => (bool)$row["store_free_shipping"],
            "store_free_shipping_threshold" => (float)$row["store_free_shipping_threshold"],

            "stripe_secret_key" => $row["stripe_secret_key"],
            "stripe_publishable_key" => $row["stripe_publishable_key"],

            "canadapost_customer_number" => $row["canadapost_customer_number"],
            "canadapost_username" => $row["canadapost_username"],
            "canadapost_password" => $row["canadapost_password"],

            "fedex_client_id" => $row["fedex_client_id"],
            "fedex_client_secret" => $row["fedex_client_secret"],
            "fedex_account_number" => $row["fedex_account_number"],

            "shipment_postal_code" => $row["shipment_postal_code"],
            "shipment_city" => $row["shipment_city"],
            "shipment_province" => $row["shipment_province"],
            "shipment_country" => $row["shipment_country"],

            "dhl_account_number" => $row["dhl_account_number"],
            "dhl_api_key" => $row["dhl_api_key"],

            "new_order_notification" => (bool)$row["new_order_notification"],
            "order_status_notification" => (bool)$row["order_status_notification"],
            "order_cancel_notification" => (bool)$row["order_cancel_notification"],
            "high_value_order_notification" => (bool)$row["high_value_order_notification"],
            "low_stock_notification" => (bool)$row["low_stock_notification"],
            "out_of_stock_notification" => (bool)$row["out_of_stock_notification"],
            "new_customer_notification" => (bool)$row["new_customer_notification"],
            "support_request_notification" => (bool)$row["support_request_notification"],
            "product_review_notification" => (bool)$row["product_review_notification"],

            "updated_at" => $row["updated_at"]
        ];

    } catch (Throwable $e) {
        http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
