<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $response = [
        "error" => true,
        "data"  => null
    ];

    if (empty($_POST['code'])) {
        $response['data'] = "Discount code is required";
        echo json_encode($response);
        exit;
    }

    $code  = strtoupper(trim($_POST['code']));
    $today = new DateTime('today');

    try {
        $stmt = $conn->prepare("
            SELECT 
                id,
                code,
                discount_type,
                discount_value,
                max_discount_amount,
                min_purchase_amount,
                start_date,
                end_date,
                status,
                is_active,
                usage_limit,
                usage_per_customer,
                total_used
            FROM discounts
            WHERE code = ?
            LIMIT 1
        ");
        $stmt->execute([$code]);
        $discount = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$discount) {
            $response['data'] = "Invalid discount code";
            echo json_encode($response);
            exit;
        }

        if ((int)$discount->is_active !== 1 || $discount->status !== 'active') {
            $response['data'] = "Discount is not active";
            echo json_encode($response);
            exit;
        }

        if (!empty($discount->start_date) && new DateTime($discount->start_date) > $today) {
            $response['data'] = "Discount not available yet";
            echo json_encode($response);
            exit;
        }

        if (!empty($discount->end_date) && new DateTime($discount->end_date) < $today) {
            $response['data'] = "Discount has expired";
            echo json_encode($response);
            exit;
        }

        if (
            !empty($discount->usage_limit) &&
            (int)$discount->usage_limit > 0 &&
            $discount->total_used >= $discount->usage_limit
        ) {
            $response['data'] = "Discount usage limit reached";
            echo json_encode($response);
            exit;
        }

        $minPurchase = (!empty($discount->min_purchase_amount) && $discount->min_purchase_amount > 0)
            ? (float)$discount->min_purchase_amount
            : 0;

        $response['error'] = false;
        $response['data'] = [
            "id"               => (int)$discount->id,
            "code"             => $discount->code,
            "type"             => $discount->discount_type,
            "value"            => $discount->discount_type === 'free_shipping'
                                    ? 0
                                    : (float)$discount->discount_value,
            "maxDiscount"      => (float)($discount->max_discount_amount ?? 0),
            "minPurchase"      => $minPurchase,
            "usagePerCustomer" => (!empty($discount->usage_per_customer) && $discount->usage_per_customer > 0)
                                    ? (int)$discount->usage_per_customer
                                    : 0
        ];

    } catch (PDOException $e) {
        $response['data'] = "Server error";
    }

    echo json_encode($response);
