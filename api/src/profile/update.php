<?php
    require_once dirname(__DIR__, 2) . '/include/verify-user.php';

    $required = ["first_name", "last_name", "mobile_number"];
    foreach ($required as $field) {
        if (!isset($_POST[$field]) || trim($_POST[$field]) === "") {
            echo json_encode(["data" => ucfirst(str_replace("_", " ", $field)) . " is required", "error" => true]);
            exit;
        }
    }

    $first_name = trim($_POST["first_name"]);
    $last_name = trim($_POST["last_name"]);
    $mobile = trim($_POST["mobile_number"]);
    $dob = trim($_POST["dob"]);
    $save = $conn->prepare("UPDATE users SET first_name = :first_name, last_name = :last_name, mobile_number = :mobile_number, dob = :dob WHERE id = :id");

    $save->bindValue(':first_name', $first_name);
    $save->bindValue(':last_name', $last_name);
    $save->bindValue(':mobile_number', $mobile);
    $save->bindValue(':dob', $dob);
    $save->bindValue(':id', $my_details->id);
    if ($save->execute()) {
        echo json_encode([
            "data" => "Profile Updated Successfully",
            "code" => [
                "first_name" => $first_name,
                "last_name" => $last_name,
                "mobile_number" => $mobile,
                "dob" => $dob,
            ],
            "error" => false
        ]);
    } else {
        echo json_encode(["data" => "Profile Update Failed", "error" => true]);
    }
