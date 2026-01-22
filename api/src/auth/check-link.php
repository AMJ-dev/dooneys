<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";
    $check_link = $conn->prepare("SELECT id, time_expires FROM password_reset WHERE link1 = :link1 && link2 = :link2");
    $check_link->bindValue(":link1", $_POST["link1"]);
    $check_link->bindValue(":link2", $_POST["link2"]);
    $check_link->execute();
    if ($check_link->rowCount() > 0) {
        $user = $check_link->fetch(PDO::FETCH_OBJ);
        if (strtotime($date_time) < strtotime($user->time_expires))
            $error = false;
        else
            $data = "Link has expired";
    } else
        $data = "Link is invalid";
    echo json_encode(["data" => $data, "error" => $error]);