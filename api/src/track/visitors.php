<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    function uuid_v4(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $url      = $_POST['url'] ?? null;
        $referrer = $_POST['referrer'] ?? null;

        if (!$url) {
            throw new Exception("Invalid payload");
        }

        $user_id = null;

        if (!empty($_POST["auth"]) && $_POST["auth"] === "1") {
            try {
                require_once dirname(__DIR__, 2) . "/include/verify-user.php";
                $user_id = isset($my_details->id) ? (int)$my_details->id : null;
            } catch (Throwable $e) {
                $user_id = null;
            }
        }

        $is_https = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['SERVER_PORT'] ?? null) == 443
        );

        if (!isset($_COOKIE['anon_id'])) {
            $anon_id = uuid_v4();
            setcookie(
                "anon_id",
                $anon_id,
                [
                    "expires"  => time() + 31536000,
                    "path"     => "/",
                    "secure"   => $is_https,
                    "httponly" => true,
                    "samesite" => "Lax"
                ]
            );
        } else {
            $anon_id = $_COOKIE['anon_id'];
        }

        $stmt = $conn->prepare("SELECT id, user_id FROM visitors WHERE anon_id = :anon_id");
        $stmt->bindValue(":anon_id", $anon_id, PDO::PARAM_STR);
        $stmt->execute();
        $visitor = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$visitor) {
            $stmt = $conn->prepare("INSERT INTO visitors (anon_id, user_id) VALUES (:anon_id, :user_id)");
            $stmt->bindValue(":anon_id", $anon_id, PDO::PARAM_STR);
            if ($user_id !== null) {
                $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":user_id", null, PDO::PARAM_NULL);
            }
            $stmt->execute();
            $visitor_id = (int)$conn->lastInsertId();
        } else {
            $visitor_id = (int)$visitor->id;

            if ($user_id !== null && !$visitor->user_id) {
                $stmt = $conn->prepare("UPDATE visitors SET user_id = :user_id WHERE id = :id");
                $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
                $stmt->bindValue(":id", $visitor_id, PDO::PARAM_INT);
                $stmt->execute();
            }
        }

        $stmt = $conn->prepare("
            SELECT id
            FROM sessions
            WHERE visitor_id = :visitor_id
            AND last_activity > NOW() - INTERVAL 30 MINUTE
            ORDER BY id DESC
            LIMIT 1
        ");
        $stmt->bindValue(":visitor_id", $visitor_id, PDO::PARAM_INT);
        $stmt->execute();
        $session = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$session) {
            $stmt = $conn->prepare("INSERT INTO sessions (visitor_id) VALUES (:visitor_id)");
            $stmt->bindValue(":visitor_id", $visitor_id, PDO::PARAM_INT);
            $stmt->execute();
            $session_id = (int)$conn->lastInsertId();
        } else {
            $session_id = (int)$session->id;
            $stmt = $conn->prepare("UPDATE sessions SET last_activity = NOW() WHERE id = :id");
            $stmt->bindValue(":id", $session_id, PDO::PARAM_INT);
            $stmt->execute();
        }

        $stmt = $conn->prepare("
            INSERT INTO page_views (session_id, url, referrer)
            VALUES (:session_id, :url, :referrer)
        ");
        $stmt->bindValue(":session_id", $session_id, PDO::PARAM_INT);
        $stmt->bindValue(":url", $url, PDO::PARAM_STR);
        if ($referrer !== null) {
            $stmt->bindValue(":referrer", $referrer, PDO::PARAM_STR);
        } else {
            $stmt->bindValue(":referrer", null, PDO::PARAM_NULL);
        }
        $stmt->execute();

        $conn->commit();
        $data = true;

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
