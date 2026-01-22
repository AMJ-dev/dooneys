<?php
    require dirname(__DIR__, 2) . "/vendor/verify-admin.php";

    $provider = $_POST["provider"] ?? null;
    $credentials = $_POST["credentials"] ?? [];

    if (!$provider) {
        http_response_code(400);
        echo json_encode(["error" => true, "data" => "Missing provider"]);
        exit;
    }

    try {
        switch ($provider) {
            case "canadapost":
                test_canada_post($credentials);
                break;

            case "fedex":
                test_fedex($credentials);
                break;

            case "dhl":
                test_dhl($credentials);
                break;

            default:
                throw new Exception("Unsupported provider");
        }

        echo json_encode(["error" => false, "data" => true]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            "error" => true,
            "data"  => $e->getMessage()
        ]);
    }
