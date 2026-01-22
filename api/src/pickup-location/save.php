<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        if (empty($_POST)) {
            throw new Exception("Invalid request");
        }

        $id = isset($_POST['id']) ? (int)$_POST['id'] : null;

        $name    = trim($_POST['name'] ?? '');
        $type    = $_POST['type'] ?? '';
        $address = trim($_POST['address'] ?? '');
        $city    = trim($_POST['city'] ?? '');
        $state   = trim($_POST['state'] ?? '');
        $zip     = trim($_POST['zipCode'] ?? '');
        $country = trim($_POST['country'] ?? '');

        $lat = (float)($_POST['coordinates']['lat'] ?? 0);
        $lng = (float)($_POST['coordinates']['lng'] ?? 0);

        $phone   = trim($_POST['contactPhone'] ?? '');
        $email   = trim($_POST['contactEmail'] ?? '');
        $manager = trim($_POST['manager'] ?? '');

        $hours = $_POST['hours'] ?? [];
        $status = $_POST['status'] ?? 'inactive';
        $notes  = $_POST['notes'] ?? null;

        if (
            !$name || !$type || !$address || !$city || !$state ||
            !$zip || !$country || !$phone || !$email || !$manager
        ) {
            throw new Exception("Missing required fields");
        }

        $conn->beginTransaction();

        if ($id) {

            $stmt = $conn->prepare("
                UPDATE pickup_locations SET
                    name = ?,
                    type = ?,
                    address = ?,
                    city = ?,
                    state = ?,
                    zip_code = ?,
                    country = ?,
                    latitude = ?,
                    longitude = ?,
                    contact_phone = ?,
                    contact_email = ?,
                    manager = ?,
                    hours_monday = ?,
                    hours_tuesday = ?,
                    hours_wednesday = ?,
                    hours_thursday = ?,
                    hours_friday = ?,
                    hours_saturday = ?,
                    hours_sunday = ?,
                    status = ?,
                    notes = ?,
                    updated_at = NOW()
                WHERE id = ?
                LIMIT 1
            ");

            $stmt->execute([
                $name,
                $type,
                $address,
                $city,
                $state,
                $zip,
                $country,
                $lat,
                $lng,
                $phone,
                $email,
                $manager,
                $hours['monday'] ?? null,
                $hours['tuesday'] ?? null,
                $hours['wednesday'] ?? null,
                $hours['thursday'] ?? null,
                $hours['friday'] ?? null,
                $hours['saturday'] ?? null,
                $hours['sunday'] ?? null,
                $status,
                $notes,
                $id
            ]);

        } else {

            $stmt = $conn->prepare("
                INSERT INTO pickup_locations (
                    name, type, address, city, state, zip_code, country,
                    latitude, longitude,
                    contact_phone, contact_email, manager,
                    hours_monday, hours_tuesday, hours_wednesday, hours_thursday,
                    hours_friday, hours_saturday, hours_sunday,
                    status, notes, created_at
                ) VALUES (
                    ?,?,?,?,?,?,?,
                    ?,?,
                    ?,?,?,
                    ?,?,?,?,
                    ?,?,?,
                    ?,?,NOW()
                )
            ");

            $stmt->execute([
                $name,
                $type,
                $address,
                $city,
                $state,
                $zip,
                $country,
                $lat,
                $lng,
                $phone,
                $email,
                $manager,
                $hours['monday'] ?? null,
                $hours['tuesday'] ?? null,
                $hours['wednesday'] ?? null,
                $hours['thursday'] ?? null,
                $hours['friday'] ?? null,
                $hours['saturday'] ?? null,
                $hours['sunday'] ?? null,
                $status,
                $notes
            ]);

            $id = (int)$conn->lastInsertId();
        }

        $conn->commit();

        $data = [
            "id" => $id,
            "status" => "success"
        ];

    } catch (Throwable $e) {

        if ($conn->inTransaction()) {
            $conn->rollBack();
        }

        $error = true;
        $data = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
