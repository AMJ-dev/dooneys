<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        if (!isset($_POST["id"], $_POST["status"])) {
            throw new Exception("Invalid request");
        }

        $user_id = (int) $_POST["id"];
        $status  = (int) $_POST["status"];

        if (!in_array($status, [1, 2], true)) {
            throw new Exception("Invalid status value");
        }

        $chk = $conn->prepare("
            SELECT id, email, first_name, role 
            FROM users 
            WHERE id = :id 
        ");
        $chk->execute([":id" => $user_id]);

        if ($chk->rowCount() === 0) {
            throw new Exception("User not found");
        }

        $user = $chk->fetch(PDO::FETCH_OBJ);

        if ($user->role === "admin" && $status === 2) {
            throw new Exception("Administrator cannot be suspended");
        }

        $stmt = $conn->prepare("
            UPDATE users 
            SET status = :status 
            WHERE id = :id
        ");
        $stmt->execute([
            ":status" => $status,
            ":id"     => $user_id
        ]);

        if ($status === 1) {
            $subject = "Welcome Back to {$AppName}! Your Account is Active";
            $msg = generateActivationEmail(
                $user->first_name,
                $AppName,
                $baseURL,
                $comp_logo,
                $comp_email,
                $comp_phone,
                $comp_address
            );
        } else {
            $subject = "Important: Your {$AppName} Account Has Been Suspended";
            $msg = generateSuspensionEmail(
                $user->first_name,
                $AppName,
                $baseURL,
                $comp_logo,
                $comp_email,
                $comp_phone,
                $comp_address
            );
        }

        send_email($user->email, $user->first_name, $subject, $msg);

        $data = "User status updated successfully";

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);

    function generateActivationEmail($name, $AppName, $baseURL, $comp_logo, $comp_email, $comp_phone, $comp_address) {
        $currentDate = date('F j, Y');
        $shopUrl = $baseURL . "/shop";
        $helpCenterUrl = $baseURL . "/help";
        $supportUrl = $baseURL . "/support";
        
        return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activated</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f6f2; font-family: Arial, sans-serif; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome Back!</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.95;">Your {$AppName} Account Has Been Reactivated</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 36px;">✓</span>
                    </div>
                    <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 24px;">Hello, {$name}!</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                        We're delighted to inform you that your account has been successfully reactivated. 
                        You now have full access to our premium beauty collection!
                    </p>
                </div>
                
                <!-- Highlights -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="margin: 0 0 10px; color: #92400e; font-size: 18px;">🎉 Welcome Back Perks</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                        <li style="margin-bottom: 8px;">Full access to our beauty catalog</li>
                        <li style="margin-bottom: 8px;">Exclusive member-only discounts</li>
                        <li style="margin-bottom: 8px;">Priority customer support</li>
                        <li>Early access to new collections</li>
                    </ul>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{$shopUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                        Start Shopping Now
                    </a>
                </div>
                
                <!-- Help Section -->
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-top: 40px;">
                    <h4 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Need Help?</h4>
                    <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Our customer support team is here to assist you. Feel free to reach out anytime.
                    </p>
                    <div style="color: #6b7280; font-size: 14px;">
                        <p style="margin: 5px 0;"><strong>📧 Email:</strong> {$comp_email}</p>
                        <p style="margin: 5px 0;"><strong>📞 Phone:</strong> {$comp_phone}</p>
                        <p style="margin: 5px 0;"><strong>🕒 Hours:</strong> Mon-Fri, 9am-6pm EST</p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <div style="margin-bottom: 15px;">
                    <img src="{$comp_logo}" alt="{$AppName}" style="height: 32px;">
                </div>
                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                    &copy; {$currentDate} {$AppName}. All rights reserved.<br>
                    {$comp_address}
                </p>
                <div style="margin-top: 15px;">
                    <a href="{$baseURL}/facebook" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Facebook</a>
                    <a href="{$baseURL}/instagram" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Instagram</a>
                    <a href="{$baseURL}/twitter" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Twitter</a>
                    <a href="{$baseURL}/pinterest" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Pinterest</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    HTML;
    }

    function generateSuspensionEmail($name, $AppName, $baseURL, $comp_logo, $comp_email, $comp_phone, $comp_address) {
        $currentDate = date('F j, Y');
        $supportUrl = $baseURL . "/support";
        
        return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Suspended</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f6f2; font-family: Arial, sans-serif; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); padding: 40px 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Account Notice</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.95;">Important Update Regarding Your {$AppName} Account</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background-color: #ef4444; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 36px;">⚠</span>
                    </div>
                    <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 24px;">Hello, {$name}</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                        We regret to inform you that your {$AppName} account has been temporarily suspended. 
                        This action was taken due to a violation of our Terms of Service.
                    </p>
                </div>
                
                <!-- Important Notice -->
                <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px;">⚠️ Important Information</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                        <li style="margin-bottom: 8px;">Your account access has been temporarily restricted</li>
                        <li style="margin-bottom: 8px;">You cannot make purchases or access member features</li>
                        <li style="margin-bottom: 8px;">Your existing orders will still be processed</li>
                        <li>Account data remains secure and protected</li>
                    </ul>
                </div>
                
                <!-- Next Steps -->
                <div style="background-color: #eff6ff; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <h4 style="margin: 0 0 15px; color: #1e40af; font-size: 18px;">🔍 Next Steps</h4>
                    <p style="margin: 0 0 15px; color: #374151; font-size: 14px; line-height: 1.6;">
                        To restore your account, please contact our support team for assistance. 
                        We're here to help resolve any issues.
                    </p>
                    <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 10px;">
                        <a href="{$supportUrl}" style="color: white; text-decoration: none;">Contact Support</a>
                    </div>
                </div>
                
                <!-- Support Section -->
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-top: 30px;">
                    <h4 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">📞 Contact Our Support Team</h4>
                    <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Our team is ready to assist you in resolving this matter. Please provide your account details when contacting us.
                    </p>
                    <div style="color: #6b7280; font-size: 14px;">
                        <p style="margin: 5px 0;"><strong>📧 Email:</strong> {$comp_email}</p>
                        <p style="margin: 5px 0;"><strong>📞 Phone:</strong> {$comp_phone}</p>
                        <p style="margin: 5px 0;"><strong>📍 Support Portal:</strong> {$supportUrl}</p>
                        <p style="margin: 5px 0;"><strong>📝 Reference:</strong> Account Suspension - {$currentDate}</p>
                    </div>
                </div>
                
                <!-- FAQ -->
                <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <h5 style="margin: 0 0 15px; color: #374151; font-size: 16px;">❓ Common Questions</h5>
                    <div style="margin-bottom: 12px;">
                        <p style="margin: 0 0 5px; font-weight: 600; color: #4b5563; font-size: 14px;">How long will my account be suspended?</p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">Suspensions are reviewed on a case-by-case basis. Contact support for specific timeline information.</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px; font-weight: 600; color: #4b5563; font-size: 14px;">Will my data be deleted?</p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">No, your account data remains secure and will not be deleted during suspension.</p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <div style="margin-bottom: 15px;">
                    <img src="{$comp_logo}" alt="{$AppName}" style="height: 32px;">
                </div>
                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                    &copy; {$currentDate} {$AppName}. All rights reserved.<br>
                    {$comp_address}
                </p>
                <div style="margin-top: 15px;">
                    <a href="{$baseURL}terms" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
                    <a href="{$baseURL}privacy" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
                    <a href="{$baseURL}contact" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Help Center</a>
                </div>
                <p style="margin: 15px 0 0; color: #94a3b8; font-size: 11px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    HTML;
    }