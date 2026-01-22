<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        $id = (int)($_GET["id"] ?? 0);
        if ($id <= 0) {
            throw new Exception("Invalid pickup location ID");
        }

        $stmt = $conn->prepare("
            SELECT
                id,
                name,
                type,
                address,
                city,
                state,
                zip_code,
                country,
                latitude,
                longitude,
                contact_phone,
                contact_email,
                manager,
                hours_monday,
                hours_tuesday,
                hours_wednesday,
                hours_thursday,
                hours_friday,
                hours_saturday,
                hours_sunday,
                status,
                notes,
                created_at,
                updated_at
            FROM pickup_locations
            WHERE id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $r = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$r) {
            throw new Exception("Pickup location not found");
        }

        $data = [
            "id" => (string)$r["id"],
            "name" => $r["name"],
            "type" => $r["type"],
            "address" => $r["address"],
            "city" => $r["city"],
            "state" => $r["state"],
            "zipCode" => $r["zip_code"],
            "country" => $r["country"],
            "coordinates" => [
                "lat" => (float)$r["latitude"],
                "lng" => (float)$r["longitude"]
            ],
            "contactPhone" => $r["contact_phone"],
            "contactEmail" => $r["contact_email"],
            "manager" => $r["manager"],
            "hours" => [
                "monday"    => $r["hours_monday"],
                "tuesday"   => $r["hours_tuesday"],
                "wednesday" => $r["hours_wednesday"],
                "thursday"  => $r["hours_thursday"],
                "friday"    => $r["hours_friday"],
                "saturday"  => $r["hours_saturday"],
                "sunday"    => $r["hours_sunday"]
            ],
            "status" => $r["status"],
            "notes" => $r["notes"],
            "createdAt" => date("Y-m-d", strtotime($r["created_at"])),
            "lastUpdated" => date("Y-m-d", strtotime($r["updated_at"]))
        ];

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
