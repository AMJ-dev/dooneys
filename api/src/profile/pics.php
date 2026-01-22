 <?php
    require_once dirname(__DIR__, 2) . '/include/verify-user.php';

    if (isset($_FILES["pics"]) && $_FILES["pics"]["error"] === 0) {
        $upload = upload_pics($_FILES["pics"]);

        if ($upload["error"] === true) {
            echo json_encode(["data" => $upload["message"], "error" => true]);
            exit;
        }

        $pics = $upload["path"];
        $save = $conn->prepare("UPDATE users SET pics = :pics WHERE id = :id");
        if($save->execute(["pics" => $pics, "id" => $my_details->id])){
            echo json_encode([
                "data" => "Profile Updated Successfully",
                "code" => [
                    "pics" => $pics,
                ],
                "error" => false
            ]);
        }else{
            echo json_encode(["data" => "Profile Update Failed", "error" => true]);
        }
    }
