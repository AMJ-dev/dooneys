<?php
require_once dirname(__DIR__, 2). "/include/verify-admin.php";

// Get site URL
global $apiURL;
if (!defined('SITE_URL')) {
    define('SITE_URL', $apiURL?? 'https://doonneys.com/');
}

function fb_api_call($endpoint, $params, $method = 'POST') {
    $url = "https://graph.facebook.com/". API_VERSION. "/". ltrim($endpoint, '/');

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CUSTOMREQUEST => $method,
    ]);

    if ($method === 'POST') {
        // Graph API expects form-data for most endpoints
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return [
        'http_code' => $httpCode,
        'body' => json_decode($response, true)?: $response,
        'raw' => $response,
        'curl_error' => $error
    ];
}

$error = false;
$data = null;

try {
    $conn->beginTransaction();

    $name = trim($_POST['name']?? '');
    $sku = trim($_POST['sku']?? '');
    $category_id = (int)($_POST['category_id']?? 0);
    $price = (float)($_POST['price']?? 0);
    $sub_category_id = null;
    if (isset($_POST['sub_category_id']) && $_POST['sub_category_id']!== '' && $_POST['sub_category_id']!== 'null') {
        $sub_category_id = (int)$_POST['sub_category_id'];
    }

    if ($name === '') throw new Exception("Product name is required");
    if ($category_id <= 0) throw new Exception("Invalid category");
    if ($price <= 0) throw new Exception("Price must be greater than zero");

    // Insert product
    $stmt = $conn->prepare("
        INSERT INTO products (
            name, description, category_id, sub_category_id,
            price, original_price, sku,
            status, in_stock, manage_stock,
            stock_quantity, low_stock_alert,
            weight, item_width, item_height, item_depth,
            is_best_seller, is_new
        ) VALUES (
            :name, :description, :category_id, :sub_category_id,
            :price, :original_price, :sku,
            :status, :in_stock, :manage_stock,
            :stock_quantity, :low_stock_alert,
            :weight, :item_width, :item_height, :item_depth,
            :is_best_seller, :is_new
        )
    ");

    $stmt->execute([
        ':name' => $name,
        ':description' => $_POST['description']?? null,
        ':category_id' => $category_id,
        ':sub_category_id' => $sub_category_id,
        ':price' => $price,
        ':original_price' => $_POST['original_price']?: null,
        ':sku' => $sku,
        ':status' => $_POST['status']?? 'active',
        ':in_stock' => $_POST['in_stock']?? 1,
        ':manage_stock' => $_POST['manage_stock']?? 1,
        ':stock_quantity' => (int)($_POST['stock_quantity']?? 0),
        ':low_stock_alert' => (int)($_POST['low_stock_alert']?? 10),
        ':weight' => (float)($_POST['weight']?? 0),
        ':item_width' => (float)($_POST['item_width']?? 0),
        ':item_height' => (float)($_POST['item_height']?? 0),
        ':item_depth' => (float)($_POST['item_depth']?? 0),
        ':is_best_seller' => $_POST['is_best_seller']?? 0,
        ':is_new' => $_POST['is_new']?? 0,
    ]);

    $product_id = (int)$conn->lastInsertId();

    // Handle image uploads
    $uploadedImages = [];
    if (!empty($_FILES['new_images'])) {
        foreach ($_FILES['new_images']['tmp_name'] as $i => $tmp) {
            if (empty($tmp) || $_FILES['new_images']['error'][$i]!== UPLOAD_ERR_OK) continue;

            $file = [
                'name' => $_FILES['new_images']['name'][$i],
                'type' => $_FILES['new_images']['type'][$i],
                'tmp_name' => $tmp,
                'error' => $_FILES['new_images']['error'][$i],
                'size' => $_FILES['new_images']['size'][$i],
            ];

            $up = upload_pics($file);
            if ($up['error']) throw new Exception($up['message']);

            $conn->prepare("
                INSERT INTO product_gallery (product_id, image, sort_order)
                VALUES (:pid, :img, :sort)
            ")->execute([
                ':pid' => $product_id,
                ':img' => $up['path'],
                ':sort' => $i
            ]);

            $uploadedImages[] = $up['path'];
        }
    }

    $conn->commit();

    // --- SOCIAL MEDIA INTEGRATION (after commit, so DB never rolls back if FB fails) ---
    $socialResults = [];
    $productUrl = rtrim(SITE_URL, '/'). '/product/'. $product_id;
    $imageUrl =!empty($uploadedImages)
       ? rtrim(SITE_URL, '/'). '/uploads/'. ltrim($uploadedImages[0], '/')
        : null;

    $caption = "🛍 New Product Alert!\n\n";
    $caption.= "📦 ". $name. "\n";
    $caption.= "💰 Price: $". number_format($price, 2). " CAD\n\n";
    $caption.= "🔗 Order here: ". $productUrl;

    // 1. Upload to Meta Commerce Catalog
    try {
        $catalogParams = [
            'name' => $name,
            'description' => substr(strip_tags($_POST['description']?? $name), 0, 5000),
            'retailer_id' => $sku?: "SKU-". $product_id,
            'price' => (int)($price * 100), // price in cents for some versions, but string works too
            'currency' => 'CAD',
            'availability' => 'in stock',
            'condition' => 'new',
            'url' => $productUrl,
            'access_token' => META_ACCESS_TOKEN
        ];
        if ($imageUrl) $catalogParams['image_url'] = $imageUrl;

        // Meta expects price as "12.99 CAD" for old endpoint, cents for new. We send both formats safe:
        $catalogParams['price'] = number_format($price, 2). " CAD";

        $res = fb_api_call(META_CATALOG_ID. "/products", $catalogParams);
        $socialResults['catalog'] = [
            'success' => $res['http_code'] === 200,
            'response' => $res['body']
        ];
        if ($res['http_code']!== 200) error_log("Catalog failed: ". $res['raw']);
    } catch (Throwable $e) {
        $socialResults['catalog_error'] = $e->getMessage();
    }

    // 2. Post to Facebook Page (with image properly)
    try {
        $fbPhotoId = null;
        if ($imageUrl) {
            $photoRes = fb_api_call(FACEBOOK_PAGE_ID. "/photos", [
                'url' => $imageUrl,
                'published' => 'false',
                'access_token' => META_ACCESS_TOKEN
            ]);
            if ($photoRes['http_code'] === 200 && isset($photoRes['body']['id'])) {
                $fbPhotoId = $photoRes['body']['id'];
            } else {
                error_log("FB photo upload failed: ". $photoRes['raw']);
            }
        }

        $fbPostParams = [
            'message' => $caption,
            'link' => $productUrl,
            'access_token' => META_ACCESS_TOKEN
        ];
        if ($fbPhotoId) {
            $fbPostParams['attached_media'] = json_encode([['media_fbid' => $fbPhotoId]]);
        }

        $fbRes = fb_api_call(FACEBOOK_PAGE_ID. "/feed", $fbPostParams);
        $socialResults['facebook'] = [
            'success' => $fbRes['http_code'] === 200,
            'response' => $fbRes['body']
        ];
        if ($fbRes['http_code']!== 200) error_log("FB feed failed: ". $fbRes['raw']);
    } catch (Throwable $e) {
        $socialResults['facebook_error'] = $e->getMessage();
    }

    // 3. Post to Instagram (2-step)
    if ($imageUrl && defined('INSTAGRAM_BUSINESS_ID') && INSTAGRAM_BUSINESS_ID!== 'YOUR_INSTAGRAM_BUSINESS_ID') {
        try {
            // Step 1: Create container
            $igCreate = fb_api_call(INSTAGRAM_BUSINESS_ID. "/media", [
                'image_url' => $imageUrl,
                'caption' => $caption,
                'access_token' => META_ACCESS_TOKEN
            ]);
            $creationId = $igCreate['body']['id']?? null;

            if ($creationId) {
                // Give IG a second to process image (important for large images)
                sleep(2);
                // Step 2: Publish
                $igPublish = fb_api_call(INSTAGRAM_BUSINESS_ID. "/media_publish", [
                    'creation_id' => $creationId,
                    'access_token' => META_ACCESS_TOKEN
                ]);
                $socialResults['instagram'] = [
                    'success' => $igPublish['http_code'] === 200,
                    'container_id' => $creationId,
                    'response' => $igPublish['body']
                ];
            } else {
                $socialResults['instagram'] = [
                    'success' => false,
                    'response' => $igCreate['body']
                ];
                error_log("IG create failed: ". $igCreate['raw']);
            }
        } catch (Throwable $e) {
            $socialResults['instagram_error'] = $e->getMessage();
        }
    }

    // 4. Send WhatsApp notifications (image + caption)
    try {
        $waResults = [];
        foreach (WHATSAPP_ADMIN_NUMBERS as $phoneNumber) {
            $phoneNumber = preg_replace('/[^0-9+]/', '', trim($phoneNumber));
            if (empty($phoneNumber)) continue;

            if ($imageUrl) {
                $waPayload = [
                    "messaging_product" => "whatsapp",
                    "to" => $phoneNumber,
                    "type" => "image",
                    "image" => [
                        "link" => $imageUrl,
                        "caption" => "🛍 *NEW PRODUCT* 🛍\n\n📦 *". $name. "*\n💰 *$". number_format($price, 2). " CAD*\n\n". $productUrl
                    ]
                ];
            } else {
                $waText = "🛍 *NEW PRODUCT ALERT* 🛍\n\n📦 *{$name}*\n💰 *$". number_format($price, 2). " CAD*\n\n🔗 {$productUrl}";
                $waPayload = [
                    "messaging_product" => "whatsapp",
                    "to" => $phoneNumber,
                    "type" => "text",
                    "text" => ["body" => $waText]
                ];
            }

            $ch = curl_init("https://graph.facebook.com/". API_VERSION. "/". WHATSAPP_PHONE_ID. "/messages");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($waPayload),
                CURLOPT_HTTPHEADER => [
                    "Authorization: Bearer ". META_ACCESS_TOKEN,
                    "Content-Type: application/json"
                ],
                CURLOPT_TIMEOUT => 30
            ]);
            $waRes = curl_exec($ch);
            $waCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $waResults[$phoneNumber] = [
                'success' => $waCode === 200,
                'response' => json_decode($waRes, true)
            ];
        }
        $socialResults['whatsapp'] = $waResults;
    } catch (Throwable $e) {
        $socialResults['whatsapp_error'] = $e->getMessage();
    }

    $data = [
        'id' => $product_id,
        'social_results' => $socialResults
    ];

} catch (Throwable $e) {
    if (isset($conn) && $conn->inTransaction()) $conn->rollBack();
    $error = true;
    $data = $e->getMessage();
    error_log("Product insert error: ". $e->getMessage());
}

header('Content-Type: application/json');
echo json_encode([
    'error' => $error,
    'data' => $data
]);