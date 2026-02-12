<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $conn->beginTransaction();

    $name        = trim($_POST['name'] ?? '');
    $slug        = trim($_POST['slug'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $status      = $_POST['status'] ?? 'active';

    if ($name === '' || $slug === '') {
        throw new Exception("Category name and slug are required");
    }

    if (!in_array($status, ['active','inactive'], true)) {
        $status = 'active';
    }

    $baseSlug = $slug;
    $i = 1;

    while (true) {
        $check = $conn->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
        $check->execute([':slug'=>$slug]);

        if (!$check->fetch()) break;

        $slug = $baseSlug . "-" . $i++;
    }

    $imagePath = null;
    if (!empty($_FILES['image']['name'])) {
        $upload = upload_pics($_FILES['image'], 5 * 1024 * 1024);
        if ($upload['error']) throw new Exception($upload['message']);
        $imagePath = $upload['path'];
    }

    /* ---------------- INSERT CATEGORY ---------------- */
    $stmt = $conn->prepare("
        INSERT INTO categories (name,slug,description,image,status)
        VALUES (:name,:slug,:description,:image,:status)
    ");

    $stmt->execute([
        ':name'=>$name,
        ':slug'=>$slug,
        ':description'=>$description,
        ':image'=>$imagePath,
        ':status'=>$status
    ]);

    $categoryId = $conn->lastInsertId();

    /* ---------------- INSERT SUBCATEGORIES ---------------- */
    if (!empty($_POST['subcategories'])) {

        $subs = json_decode($_POST['subcategories'], true);

        if (!is_array($subs)) throw new Exception("Invalid subcategories");

        $subStmt = $conn->prepare("
            INSERT INTO sub_categories
            (category_id,name,slug,status)
            VALUES (:category_id,:name,:slug,:status)
        ");

        foreach ($subs as $sub) {

            $subName = trim($sub['name']);
            $subSlug = trim($sub['slug']);

            if ($subName === '' || $subSlug === '') continue;

            /* ensure unique slug per category */
            $baseSubSlug = $subSlug;
            $x = 1;

            while (true) {
                $chk = $conn->prepare("
                    SELECT id FROM sub_categories
                    WHERE category_id=:cid AND slug=:slug
                ");
                $chk->execute([':cid'=>$categoryId, ':slug'=>$subSlug]);

                if (!$chk->fetch()) break;

                $subSlug = $baseSubSlug . "-" . $x++;
            }

            $subStmt->execute([
                ':category_id'=>$categoryId,
                ':name'=>$subName,
                ':slug'=>$subSlug,
                ':status'=>$sub['status']==='inactive'?'inactive':'active'
            ]);
        }
    }

    $conn->commit();

    $data = ["id"=>$categoryId];

} catch(Throwable $e){
    if ($conn->inTransaction()) $conn->rollBack();
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode(["error"=>$error,"data"=>$data]);
