<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = [];

    try {

        $stmt = $conn->query("
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
            ORDER BY created_at DESC
        ");

        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $data[] = [
                "id" => (string)$row->id,
                "name" => $row->name,
                "type" => $row->type,
                "address" => $row->address,
                "city" => $row->city,
                "state" => $row->state,
                "zipCode" => $row->zip_code,
                "country" => $row->country,
                "coordinates" => [
                    "lat" => (float)$row->latitude,
                    "lng" => (float)$row->longitude
                ],
                "contactPhone" => $row->contact_phone,
                "contactEmail" => $row->contact_email,
                "manager" => $row->manager,
                "hours" => [
                    "monday"    => $row->hours_monday,
                    "tuesday"   => $row->hours_tuesday,
                    "wednesday" => $row->hours_wednesday,
                    "thursday"  => $row->hours_thursday,
                    "friday"    => $row->hours_friday,
                    "saturday"  => $row->hours_saturday,
                    "sunday"    => $row->hours_sunday
                ],
                "status" => $row->status,
                "notes" => $row->notes,
                "createdAt" => date("Y-m-d", strtotime($row->created_at)),
                "lastUpdated" => date("Y-m-d", strtotime($row->updated_at))
            ];
        }

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
