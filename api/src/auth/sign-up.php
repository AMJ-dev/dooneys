<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $fieldLabels = [
        "email" => "Email address",
        "first_name" => "First name",
        "last_name" => "Last name",
        "mobile_number" => "Mobile number",
        "password" => "Password",
        "cpassword" => "Confirm password"
    ];

    $required = ["email", "first_name", "last_name", "mobile_number", "password", "cpassword"];

    foreach ($required as $key) {
        if (!isset($_POST[$key]) || trim($_POST[$key]) === "") {
            echo json_encode([
                "error" => true,
                "data" => ($fieldLabels[$key] ?? $key) . " is required"
            ]);
            exit;
        }
    }

    $email = strtolower(trim($_POST["email"]));
    $first_name = trim($_POST["first_name"]);
    $last_name = trim($_POST["last_name"]);
    $mobile_number = trim($_POST["mobile_number"]);
    $password = $_POST["password"];
    $cpassword = $_POST["cpassword"];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["error" => true, "data" => "Please enter a valid email address."]);
        exit;
    }

    if (strlen($password) < 8) {
        echo json_encode(["error" => true, "data" => "Password must be at least 8 characters."]);
        exit;
    }

    if ($password !== $cpassword) {
        echo json_encode(["error" => true, "data" => "Passwords do not match."]);
        exit;
    }

    try {
        $conn->beginTransaction();

        $exists = $conn->prepare("SELECT id FROM users WHERE email = :e LIMIT 1");
        $exists->execute([":e" => $email]);

        if ($exists->rowCount() > 0) {
            $conn->rollBack();
            echo json_encode(["error" => true, "data" => "Provided email is already in use."]);
            exit;
        }

        $add = $conn->prepare("
            INSERT INTO users (first_name, last_name, email, mobile_number, password, created_at)
            VALUES (:f, :l, :e, :m, :p, NOW())
        ");

        $add->execute([
            ":f" => $first_name,
            ":l" => $last_name,
            ":e" => $email,
            ":m" => $mobile_number,
            ":p" => encrypt_pass($password)
        ]);
        $user_id = $conn->lastInsertId();

        require_once __DIR__."/complete-sign-up.php";

        $conn->commit();

    } catch (Throwable $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        
        echo json_encode([
            "error" => true,
            "data" => "Registration failed. Please try again.",
            "code"=> $e->getMessage()
        ]);
        exit;
    }

    $recipientName = $first_name . " " . $last_name;
    $dashboardUrl = $baseURL . "account";
    $shopUrl = $baseURL . "shop";
    $profileUrl = $baseURL . "account/profile";
    $wishlistUrl = $baseURL . "account/wishlist";
    $currentDate = date('F j, Y');
    $joinDate = date('F j, Y \a\t g:i A');

    // Welcome Email Template for Customer
    $subject = "✨ Welcome to {$brandName} - Your Beauty Journey Begins!";

    $message = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {$brandName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Welcome Header -->
                <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                    
                    <!-- Welcome Icon -->
                    <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                            <span style="font-size: 40px; color: hsl(20,85%,50%);">🎉</span>
                        </div>
                    </div>
                    
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                        Welcome to {$brandName}!
                    </h1>
                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                        Your beauty journey starts here, {$first_name}
                    </p>
                </div>
                
                <!-- Content Area -->
                <div style="padding: 50px 40px;">
                    
                    <!-- Personal Greeting -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                            Hello, {$first_name}!
                        </h2>
                        <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                            Welcome to the {$brandName} family! We're thrilled to have you join our community of beauty enthusiasts. Your account has been successfully created.
                        </p>
                    </div>
                    
                    <!-- Welcome Gift Card -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>🎁</span>
                            <span>Welcome to Your Beauty Journey</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    👤
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Your Account</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$first_name} {$last_name}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📧
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Registered Email</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$email}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📅
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Member Since</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$joinDate}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    🔐
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Account Status</p>
                                    <p style="color: hsl(120,60%,40%); margin: 0; font-size: 15px; font-weight: 600;">✅ Active & Ready</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Start Guide -->
                    <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                            🚀 Your First Steps
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 18px;">1</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Complete your profile for personalized recommendations</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 18px;">2</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Explore our curated beauty collections</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 18px;">3</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Save your favorite products to your wishlist</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 18px;">4</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Enjoy exclusive members-only offers</span>
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{$shopUrl}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3); margin: 0 10px 10px 0;">
                                🛍️ Start Shopping
                            </a>
                            <a href="{$profileUrl}" style="display: inline-block; background: white; color: hsl(20,85%,50%); text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; border: 2px solid hsl(20,85%,50%); margin: 0 0 10px 10px;">
                                👤 Complete Profile
                            </a>
                        </div>
                    </div>
                    
                    <!-- Member Benefits -->
                    <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                        <h3 style="color: hsl(350,60%,45%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>✨</span>
                            <span>Exclusive Member Benefits</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(350,60%,80%);">
                                <div style="color: hsl(350,60%,65%); font-size: 24px; margin-bottom: 10px;">🎁</div>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px; font-weight: 600;">Welcome Discount</p>
                                <p style="color: hsl(20,30%,15%); margin: 5px 0 0 0; font-size: 13px;">Get 15% off your first order</p>
                            </div>
                            
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(350,60%,80%);">
                                <div style="color: hsl(350,60%,65%); font-size: 24px; margin-bottom: 10px;">⭐</div>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px; font-weight: 600;">Early Access</p>
                                <p style="color: hsl(20,30%,15%); margin: 5px 0 0 0; font-size: 13px;">Shop new collections first</p>
                            </div>
                            
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(350,60%,80%);">
                                <div style="color: hsl(350,60%,65%); font-size: 24px; margin-bottom: 10px;">📧</div>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px; font-weight: 600;">Beauty Tips</p>
                                <p style="color: hsl(20,30%,15%); margin: 5px 0 0 0; font-size: 13px;">Expert advice & tutorials</p>
                            </div>
                            
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(350,60%,80%);">
                                <div style="color: hsl(350,60%,65%); font-size: 24px; margin-bottom: 10px;">🎯</div>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px; font-weight: 600;">Personalized Offers</p>
                                <p style="color: hsl(20,30%,15%); margin: 5px 0 0 0; font-size: 13px;">Tailored to your beauty needs</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Account Security -->
                    <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                        <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <span>🔒</span>
                            <span>Account Security</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🔐</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Secure Password</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">📧</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Verified Email</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">📱</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Mobile Verified</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">👁️</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Privacy Protected</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                        <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                            Need help? Our beauty experts are here for you 24/7.
                        </p>
                        <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                            Radiantly yours,<br>
                            <span style="color: hsl(20,85%,50%);">The {$brandName} Team</span>
                        </p>
                    </div>
                    
                </div>
                
                <!-- Bottom Bar -->
                <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                    <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                        Member #{$user_id} • Joined: {$currentDate} • Email: {$email}
                    </p>
                    <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                        Welcome to our beauty community. Your journey to radiant skin starts here.
                    </p>
                </div>
                
            </div>

        </body>
        </html>
        HTML;

    // Send the email to user
    send_email($email, $recipientName, $subject, $message);

    // Send notification email to admin
    if($site_settings->new_customer_notification){
        $adminSubject = "✨ New Customer Registered - {$first_name} {$last_name}";
        $adminMessage = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Customer - {$brandName}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <!-- Admin Header -->
                    <div style="background: linear-gradient(135deg, hsl(210,50%,40%) 0%, hsl(210,60%,30%) 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="font-family: 'Playfair Display', serif; color: white; font-size: 28px; margin: 0; font-weight: 600;">
                            🎉 New Customer Alert
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px;">
                            Welcome aboard {$first_name} {$last_name}
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px;">
                        <div style="background: hsl(30,30%,94%); border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; font-family: 'Playfair Display', serif; font-size: 18px;">
                                📊 New Customer Summary
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                                <div style="background: white; border-radius: 8px; padding: 15px;">
                                    <p style="color: hsl(20,30%,25%); margin: 0 0 5px 0; font-weight: 600; font-size: 13px;">Customer Name</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$first_name} {$last_name}</p>
                                </div>
                                
                                <div style="background: white; border-radius: 8px; padding: 15px;">
                                    <p style="color: hsl(20,30%,25%); margin: 0 0 5px 0; font-weight: 600; font-size: 13px;">Email</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$email}</p>
                                </div>
                                
                                <div style="background: white; border-radius: 8px; padding: 15px;">
                                    <p style="color: hsl(20,30%,25%); margin: 0 0 5px 0; font-weight: 600; font-size: 13px;">Mobile</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$mobile_number}</p>
                                </div>
                                
                                <div style="background: white; border-radius: 8px; padding: 15px;">
                                    <p style="color: hsl(20,30%,25%); margin: 0 0 5px 0; font-weight: 600; font-size: 13px;">Member ID</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; font-weight: 600;">#{$user_id}</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid hsl(30,20%,88%);">
                                <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">
                                    <strong>Registration Time:</strong> {$joinDate}
                                </p>
                            </div>
                        </div>
                        
                        
                        <!-- Stats -->
                        <div style="background: linear-gradient(135deg, hsl(20,85%,95%) 0%, hsl(20,85%,92%) 100%); border-radius: 12px; padding: 20px; margin-top: 25px; text-align: center;">
                            <p style="color: hsl(20,85%,50%); margin: 0; font-weight: 600; font-size: 15px;">
                                ✨ This is our newest beauty enthusiast!
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: hsl(20,25%,8%); padding: 15px 30px; text-align: center;">
                        <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                            {$brandName} Admin Notification • {$joinDate}
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

        send_email($comp_email, "Admin", $adminSubject, $adminMessage);
    }
    
    echo json_encode(["error" => false, "data" => "Registered successfully"]);
    exit;