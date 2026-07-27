<?php
require_once dirname(__DIR__, 2) . "/include/verify-user.php";

$error = false;
$data = null;

try {
    // Check if order number is provided
    if (!isset($_GET["order_no"]) || empty($_GET["order_no"])) {
        throw new Exception("Order number is required");
    }

    // Get order with user information
    $stmt = $conn->prepare("
        SELECT 
            o.*,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.email AS user_email,
            u.mobile_number AS user_mobile
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.order_number = :order_number AND o.user_id = :user_id
        LIMIT 1
    ");
    $stmt->bindValue(":order_number", $_GET["order_no"]);
    $stmt->bindValue(":user_id", $my_details->id);
    $stmt->execute();

    $order = $stmt->fetch(PDO::FETCH_OBJ);

    if (!$order) {
        throw new Exception("Order not found");
    }

    // Order status history
    $get_history = $conn->prepare("
        SELECT 
            *,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS formatted_date
        FROM order_status_history
        WHERE order_id = :order_id
        ORDER BY created_at DESC
    ");
    $get_history->bindValue(":order_id", $order->id);
    $get_history->execute();
    $history = $get_history->fetchAll(PDO::FETCH_OBJ);

    // Order items with product details and images
    $get_items = $conn->prepare("
        SELECT 
            oi.*,
            p.name AS product_name,
            p.sku AS product_sku,
            p.price AS product_price,
            p.status AS product_status,
            c.name AS category_name,
            (
                SELECT image 
                FROM product_gallery pg 
                WHERE pg.product_id = oi.product_id 
                ORDER BY pg.sort_order ASC, pg.id ASC 
                LIMIT 1
            ) AS image,
            (
                SELECT COUNT(*) 
                FROM product_gallery pg 
                WHERE pg.product_id = oi.product_id 
            ) AS total_images
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE oi.order_id = :order_id
        ORDER BY oi.id ASC
    ");
    $get_items->bindValue(":order_id", $order->id);
    $get_items->execute();
    $items = $get_items->fetchAll(PDO::FETCH_OBJ);

    // Get item variants
    foreach ($items as $item) {
        $get_variants = $conn->prepare("
            SELECT 
                oiv.*,
                pv.variant_type,
                pv.product_id
            FROM order_item_variants oiv
            LEFT JOIN product_variants pv ON pv.id = oiv.product_variant_id
            WHERE oiv.order_item_id = :order_item_id
        ");
        $get_variants->bindValue(":order_item_id", $item->id);
        $get_variants->execute();
        $item->variants = $get_variants->fetchAll(PDO::FETCH_OBJ);
    }

    // Shipping address
    $get_address = $conn->prepare("
        SELECT 
            oa.*,
            CASE 
                WHEN oa.province = 'Federal Capital Territory' THEN 'FCT'
                ELSE oa.province
            END AS province_short
        FROM order_addresses oa
        WHERE oa.order_id = :order_id
        LIMIT 1
    ");
    $get_address->bindValue(":order_id", $order->id);
    $get_address->execute();
    $address = $get_address->fetch(PDO::FETCH_OBJ);

    // Payment details
    $get_payment = $conn->prepare("
        SELECT 
            p.*,
            p.method AS payment_method,
            p.status AS payment_status,
            p.amount AS payment_amount,
            p.currency AS payment_currency,
            p.created_at AS payment_date
        FROM payments p
        WHERE p.order_id = :order_id
        ORDER BY p.id DESC
        LIMIT 1
    ");
    $get_payment->bindValue(":order_id", $order->id);
    $get_payment->execute();
    $payment = $get_payment->fetch(PDO::FETCH_OBJ);

    // Pickup location if applicable
    $pickup = null;
    if ($order->pickup_id) {
        $get_pickup = $conn->prepare("
            SELECT *
            FROM pickup_locations
            WHERE id = :pickup_id
            AND status = 'active'
            LIMIT 1
        ");
        $get_pickup->bindValue(":pickup_id", $order->pickup_id);
        $get_pickup->execute();
        $pickup = $get_pickup->fetch(PDO::FETCH_OBJ);
    }

    // Discount usage if applicable
    $discount = null;
    if ($order->discount_code) {
        $get_discount = $conn->prepare("
            SELECT 
                d.*,
                du.discount_amount AS applied_amount,
                du.used_at AS discount_used_at
            FROM discount_usage du
            LEFT JOIN discounts d ON d.id = du.discount_id
            WHERE du.order_id = :order_id
            LIMIT 1
        ");
        $get_discount->bindValue(":order_id", $order->id);
        $get_discount->execute();
        $discount = $get_discount->fetch(PDO::FETCH_OBJ);
    }

    // Calculate order summary
    $subtotal = floatval($order->subtotal ?? 0);
    $tax = floatval($order->tax_amount ?? 0);
    $shipping = floatval($order->shipping_cost ?? 0);
    $discount_amount = floatval($order->discount_amount ?? 0);
    $total = floatval($order->total_amount ?? 0);

    // Determine status
    $status = $order->order_status ?? $order->status ?? "pending";

    // Build the response data
    $data = (object)[
        "order" => $order,
        "history" => $history,
        "items" => $items,
        "address" => $address,
        "payment" => $payment,
        "pickup" => $pickup,
        "discount" => $discount,
        "trackingNumber" => $order->tracking_number ?? null,
        "carrier" => $order->shipping_carrier ?? null,
        "status" => $status,
        "estimatedDelivery" => $order->shipping_eta ?? null,
        "currentStep" => getCurrentStep($status),
        "summary" => (object)[
            "subtotal" => $subtotal,
            "tax" => $tax,
            "shipping" => $shipping,
            "discount" => $discount_amount,
            "total" => $total,
            "currency" => $order->currency ?? "CAD"
        ],
        "orderSource" => $order->order_source ?? "checkout",
        "fulfillmentMethod" => $order->fulfillment_method ?? "shipping",
        "paymentStatus" => $order->payment_status ?? "pending"
    ];

    // Add tracking details if available
    if (!empty($order->tracking_number) && !empty($order->shipping_carrier)) {
        $data->trackingDetails = getTrackingDetails(
            $order->tracking_number,
            $order->shipping_carrier,
            $history
        );
    }

    // Add order source display
    $sourceLabels = [
        "checkout" => "Online Checkout",
        "pos" => "In-Store Purchase",
        "admin" => "Admin Created"
    ];
    $data->orderSourceDisplay = $sourceLabels[$order->order_source ?? "checkout"] ?? "Online Checkout";

} catch (Throwable $e) {
    http_response_code(400);
    $error = true;
    $data = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data" => $data
]);


function getCurrentStep($status)
{
    $steps = [
        "pending" => 1,
        "processing" => 2,
        "packaging" => 2,
        "shipped" => 3,
        "ready_for_pickup" => 3,
        "delivered" => 4,
        "cancelled" => 0
    ];

    return $steps[$status] ?? 1;
}

function getTrackingDetails($trackingNumber, $carrier, $history = null)
{
    $trackingEvents = [];

    // Build events from history if available
    if ($history && is_array($history)) {
        foreach ($history as $event) {
            $trackingEvents[] = (object)[
                "date" => $event->created_at,
                "location" => getLocationForStatus($event->status),
                "description" => $event->note ?? getStatusDescription($event->status),
                "status" => $event->status,
                "changed_by" => $event->changed_by ?? "system"
            ];
        }
    }

    // If no history, add default tracking events
    if (empty($trackingEvents)) {
        $trackingEvents[] = (object)[
            "date" => date("Y-m-d H:i:s", strtotime("-2 days")),
            "location" => "Order Processing Center",
            "description" => "Order has been received and is being processed",
            "status" => "processing",
            "changed_by" => "system"
        ];

        $trackingEvents[] = (object)[
            "date" => date("Y-m-d H:i:s", strtotime("-1 day")),
            "location" => "Distribution Center",
            "description" => "Package has been processed and is ready for shipment",
            "status" => "shipped",
            "changed_by" => "system"
        ];

        $trackingEvents[] = (object)[
            "date" => date("Y-m-d H:i:s"),
            "location" => "In Transit",
            "description" => "Package is currently in transit to the destination",
            "status" => "in_transit",
            "changed_by" => "system"
        ];
    }

    return (object)[
        "trackingNumber" => $trackingNumber,
        "carrier" => $carrier,
        "status" => "in_transit",
        "estimatedDelivery" => date("Y-m-d", strtotime("+3 days")),
        "events" => $trackingEvents,
        "lastUpdate" => date("Y-m-d H:i:s"),
        "carrierUrl" => getCarrierTrackingUrl($carrier, $trackingNumber)
    ];
}

function getLocationForStatus($status)
{
    $locations = [
        "pending" => "Online Store",
        "processing" => "Processing Center",
        "packaging" => "Warehouse",
        "shipped" => "Distribution Center",
        "ready_for_pickup" => "Store Location",
        "delivered" => "Destination",
        "cancelled" => "System"
    ];

    return $locations[$status] ?? "Unknown Location";
}

function getStatusDescription($status)
{
    $descriptions = [
        "pending" => "Order has been placed and is awaiting processing",
        "processing" => "Order is being processed and prepared for shipment",
        "packaging" => "Items are being packaged for shipment",
        "shipped" => "Order has been shipped and is on its way",
        "ready_for_pickup" => "Order is ready for pickup at the store",
        "delivered" => "Order has been successfully delivered",
        "cancelled" => "Order has been cancelled"
    ];

    return $descriptions[$status] ?? "Status update";
}

function getCarrierTrackingUrl($carrier, $trackingNumber)
{
    $carrier = strtolower($carrier);
    $urls = [
        "canada post" => "https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=",
        "canadapost" => "https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=",
        "fedex" => "https://www.fedex.com/apps/fedextrack/?tracknumbers=",
        "ups" => "https://www.ups.com/track?tracknum=",
        "dhl" => "https://www.dhl.com/en/express/tracking.html?AWB=",
        "purolator" => "https://www.purolator.com/en/shipping/tracker?trackingnumber="
    ];

    $baseUrl = $urls[$carrier] ?? $urls["canada post"];
    return $baseUrl . $trackingNumber;
}