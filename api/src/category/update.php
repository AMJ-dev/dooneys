<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {
    $conn->beginTransaction();

    $id          = (int)($_POST['id'] ?? 0);
    $name        = trim($_POST['name'] ?? '');
    $slug        = trim($_POST['slug'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $status      = $_POST['status'] ?? 'active';

    if ($id <= 0 || $name === '' || $slug === '') {
        throw new Exception("Invalid request");
    }

    if (!in_array($status, ['active', 'inactive'], true)) {
        $status = 'active';
    }

    /* ---------------- GET OLD IMAGE ---------------- */
    $get = $conn->prepare("SELECT image FROM categories WHERE id = :id LIMIT 1");
    $get->execute([':id' => $id]);

    if ($get->rowCount() === 0) throw new Exception("Category not found");

    $oldImage = $get->fetch(PDO::FETCH_OBJ)->image;

    /* ---------------- ENSURE UNIQUE SLUG ---------------- */
    $baseSlug = $slug;
    $i = 1;

    while (true) {
        $check = $conn->prepare("
            SELECT id FROM categories 
            WHERE slug = :slug AND id != :id LIMIT 1
        ");
        $check->execute([':slug' => $slug, ':id' => $id]);

        if ($check->rowCount() === 0) break;

        $slug = $baseSlug . '-' . $i++;
    }

    /* ---------------- HANDLE IMAGE ---------------- */
    $imagePath = $oldImage;

    if (!empty($_FILES['image']['name'])) {
        $upload = upload_pics($_FILES['image'], 5 * 1024 * 1024);
        if ($upload['error']) throw new Exception($upload['message']);

        $imagePath = $upload['path'];

        if (!empty($oldImage)) delete_file($oldImage);
    }

    /* ---------------- UPDATE CATEGORY ---------------- */
    $stmt = $conn->prepare("
        UPDATE categories 
        SET name = :name, slug = :slug, description = :description, image = :image, status = :status
        WHERE id = :id LIMIT 1
    ");

    $stmt->execute([
        ':name' => $name,
        ':slug' => $slug,
        ':description' => $description,
        ':image' => $imagePath,
        ':status' => $status,
        ':id' => $id
    ]);

    /* ============================================================
       ✅ UPDATE EXISTING SUBCATEGORIES
       ============================================================ */
    
    if (!empty($_POST['existing_subcategories'])) {
        $existingSubs = json_decode($_POST['existing_subcategories'], true);
        
        if (is_array($existingSubs)) {
            $updateSub = $conn->prepare("
                UPDATE sub_categories 
                SET name = :name, slug = :slug, status = :status
                WHERE id = :id AND category_id = :category_id LIMIT 1
            ");
            
            foreach ($existingSubs as $sub) {
                $subId    = (int)($sub['id'] ?? 0);
                $subName  = trim($sub['name'] ?? '');
                $subSlug  = trim($sub['slug'] ?? '');
                $subStatus = $sub['status'] ?? 'active';
                
                if ($subId <= 0 || $subName === '' || $subSlug === '') continue;
                
                // Ensure slug is unique within this category (excluding current subcategory)
                $baseSubSlug = $subSlug;
                $x = 1;
                
                while (true) {
                    $chk = $conn->prepare("
                        SELECT id FROM sub_categories 
                        WHERE category_id = :cid AND slug = :slug AND id != :id LIMIT 1
                    ");
                    $chk->execute([
                        ':cid' => $id,
                        ':slug' => $subSlug,
                        ':id' => $subId
                    ]);
                    
                    if ($chk->rowCount() === 0) break;
                    
                    $subSlug = $baseSubSlug . '-' . $x++;
                }
                
                $updateSub->execute([
                    ':id' => $subId,
                    ':category_id' => $id,
                    ':name' => $subName,
                    ':slug' => $subSlug,
                    ':status' => ($subStatus === 'inactive' ? 'inactive' : 'active')
                ]);
            }
        }
    }

    /* ============================================================
       ✅ INSERT NEW SUBCATEGORIES
       ============================================================ */

    if (!empty($_POST['new_subcategories'])) {
        $newSubs = json_decode($_POST['new_subcategories'], true);

        if (is_array($newSubs)) {
            $insertSub = $conn->prepare("
                INSERT INTO sub_categories (category_id, name, slug, status)
                VALUES (:category_id, :name, :slug, :status)
            ");

            foreach ($newSubs as $sub) {
                $subName = trim($sub['name'] ?? '');
                $subSlug = trim($sub['slug'] ?? '');

                if ($subName === '' || $subSlug === '') continue;

                /* --- Ensure slug unique within this category --- */
                $baseSubSlug = $subSlug;
                $x = 1;

                while (true) {
                    $chk = $conn->prepare("
                        SELECT id FROM sub_categories 
                        WHERE category_id = :cid AND slug = :slug LIMIT 1
                    ");
                    $chk->execute([
                        ':cid' => $id,
                        ':slug' => $subSlug
                    ]);

                    if ($chk->rowCount() === 0) break;

                    $subSlug = $baseSubSlug . '-' . $x++;
                }

                $insertSub->execute([
                    ':category_id' => $id,
                    ':name' => $subName,
                    ':slug' => $subSlug,
                    ':status' => ($sub['status'] === 'inactive' ? 'inactive' : 'active')
                ]);
            }
        }
    }

    $conn->commit();

    $data = [
        "id" => $id,
        "name" => $name,
        "slug" => $slug,
        "image" => $imagePath,
        "status" => $status
    ];

} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode(["error" => $error, "data" => $data]);