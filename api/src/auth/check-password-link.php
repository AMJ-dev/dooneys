<?php
require_once dirname(__DIR__, 2) . "/include/set-header.php";
$check_link = $conn->prepare("SELECT id, time_expires FROM password_reset WHERE link1 = :link1 && link2 = :link2");
$check_link->bindValue(":link1", $_POST["code1"]);
$check_link->bindValue(":link2", $_POST["code2"]);
$check_link->execute();
if ($check_link->rowCount() > 0) {
    $user_link = $check_link->fetch(PDO::FETCH_OBJ);
    if (strtotime($date_time) < strtotime($user_link->time_expires)) {
        $error = false;
    } else {
        $data = "Link has expired";
        $error = true;
    }
}
echo json_encode(["data" => $data, "error" => $error]);