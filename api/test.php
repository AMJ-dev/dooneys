<?php
    require_once __DIR__."/include/conn.php";
    $update = $conn->prepare("UPDATE users SET password=:pass");
    $update->execute([":pass"=>encrypt_pass("Group2020@")]);
