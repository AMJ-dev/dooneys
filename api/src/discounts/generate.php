<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    function generate_secure_discount_code(PDO $conn): string {
        $prefixes = ["DOON", "BEAUTY", "SALE", "VIP", "LOVE", "GLAM"];
        $chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        do {
            $prefix = $prefixes[array_rand($prefixes)];
            $entropy = microtime(true) . random_bytes(16);
            $hash    = hash('sha256', $entropy, true);
            $encoded = '';
            for ($i = 0; $i < strlen($hash); $i++) $encoded .= $chars[ord($hash[$i]) % strlen($chars)];
            $segment1 = substr($encoded, 0, 4);
            $segment2 = substr($encoded, 4, 2);

            $code = "{$prefix}-{$segment1}-{$segment2}";
            $stmt = $conn->prepare("SELECT id FROM discounts WHERE code = :code LIMIT 1");
            $stmt->execute([':code' => $code]);
            $exists = $stmt->fetch(PDO::FETCH_ASSOC);
        } while ($exists);
        return $code;
    }

    try {
        $data = [
            "code" => generate_secure_discount_code($conn)
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
