<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        function bool_val(string $key): int {
            return isset($_POST[$key]) &&
                (
                    $_POST[$key] === "true" ||
                    $_POST[$key] === "1" ||
                    $_POST[$key] === 1 ||
                    $_POST[$key] === true
                )
                ? 1
                : 0;
        }

        $stmt = $conn->prepare("
            UPDATE store_settings SET
                -- General
                store_gst = :store_gst,
                store_free_shipping = :store_free_shipping,
                store_free_shipping_threshold = :store_free_shipping_threshold,

                -- Stripe
                stripe_secret_key = :stripe_secret_key,
                stripe_publishable_key = :stripe_publishable_key,

                -- Canada Post
                canadapost_customer_number = :canadapost_customer_number,
                canadapost_username = :canadapost_username,
                canadapost_password = :canadapost_password,

                -- FedEx
                fedex_client_id = :fedex_client_id,
                fedex_client_secret = :fedex_client_secret,
                fedex_account_number = :fedex_account_number,

                -- Shipment Origin
                shipment_postal_code = :shipment_postal_code,
                shipment_city = :shipment_city,
                shipment_province = :shipment_province,
                shipment_country = :shipment_country,

                -- DHL
                dhl_account_number = :dhl_account_number,
                dhl_api_key = :dhl_api_key,

                -- Notifications
                new_order_notification = :new_order_notification,
                order_cancel_notification = :order_cancel_notification,

                low_stock_notification = :low_stock_notification,
                out_of_stock_notification = :out_of_stock_notification,

                new_customer_notification = :new_customer_notification,
                support_request_notification = :support_request_notification,
                product_review_notification = :product_review_notification,

                updated_at = NOW()
            WHERE id = 1
            LIMIT 1
        ");
        // General
        $stmt->bindValue(":store_gst", $_POST["store_gst"] ?? "0");
        $stmt->bindValue(":store_free_shipping", bool_val("store_free_shipping"), PDO::PARAM_BOOL);
        $stmt->bindValue(":store_free_shipping_threshold", (float)($_POST["store_free_shipping_threshold"] ?? 0));

        // Stripe
        $stmt->bindValue(":stripe_secret_key", trim($_POST["stripe_secret_key"] ?? ""));
        $stmt->bindValue(":stripe_publishable_key", trim($_POST["stripe_publishable_key"] ?? ""));

        // Canada Post
        $stmt->bindValue(":canadapost_customer_number", trim($_POST["canadapost_customer_number"] ?? ""));
        $stmt->bindValue(":canadapost_username", trim($_POST["canadapost_username"] ?? ""));
        $stmt->bindValue(":canadapost_password", trim($_POST["canadapost_password"] ?? ""));

        // FedEx
        $stmt->bindValue(":fedex_client_id", trim($_POST["fedex_client_id"] ?? ""));
        $stmt->bindValue(":fedex_client_secret", trim($_POST["fedex_client_secret"] ?? ""));
        $stmt->bindValue(":fedex_account_number", trim($_POST["fedex_account_number"] ?? ""));

        // DHL
        $stmt->bindValue(":dhl_account_number", trim($_POST["dhl_account_number"] ?? ""));
        $stmt->bindValue(":dhl_api_key", trim($_POST["dhl_api_key"] ?? ""));

        // Shipment Origin
        $stmt->bindValue(":shipment_postal_code", strtoupper(trim($_POST["shipment_postal_code"] ?? "")));
        $stmt->bindValue(":shipment_city", trim($_POST["shipment_city"] ?? ""));
        $stmt->bindValue(":shipment_province", strtoupper(trim($_POST["shipment_province"] ?? "")));
        $stmt->bindValue(":shipment_country", strtoupper(trim($_POST["shipment_country"] ?? "CA")));

        // Notifications
        $stmt->bindValue(":new_order_notification", bool_val("new_order_notification"), PDO::PARAM_BOOL);
        $stmt->bindValue(":order_cancel_notification", bool_val("order_cancel_notification"), PDO::PARAM_BOOL);

        $stmt->bindValue(":low_stock_notification", bool_val("low_stock_notification"), PDO::PARAM_BOOL);
        $stmt->bindValue(":out_of_stock_notification", bool_val("out_of_stock_notification"), PDO::PARAM_BOOL);

        $stmt->bindValue(":new_customer_notification", bool_val("new_customer_notification"), PDO::PARAM_BOOL);
        $stmt->bindValue(":support_request_notification", bool_val("support_request_notification"), PDO::PARAM_BOOL);
        $stmt->bindValue(":product_review_notification", bool_val("product_review_notification"), PDO::PARAM_BOOL);

        $stmt->execute();

        // Fetch updated settings
        $fetch = $conn->prepare("SELECT * FROM store_settings WHERE id = 1 LIMIT 1");
        $fetch->execute();
        $row = $fetch->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception("Failed to fetch updated settings");
        }

        // Cast booleans for frontend
        foreach ($row as $key => $value) {
            if (
                str_contains($key, "_notification") ||
                $key === "store_free_shipping"
            ) {
                $row[$key] = (bool)$value;
            }
        }

        $data = $row;

    } catch (Throwable $e) {
        http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
