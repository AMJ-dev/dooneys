<?php
    $save = $conn->prepare("INSERT INTO password_reset (user_id) VALUES (:user_id)");
    $save->execute([":user_id" => $user_id]);

    $save = $conn->prepare("INSERT INTO user_notifications (user_id, ) VALUES (:user_id)");
    $save->execute([":user_id" => $user_id]);