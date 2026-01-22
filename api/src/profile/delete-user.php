<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $user = get_user($_POST["id"], "email, first_name, last_name, mobile_number");

        if (!$user) throw new Exception("User not found");
        
        $stmt = $conn->prepare("DELETE FROM users WHERE id = :uid LIMIT 1");
        $stmt->bindValue(':uid', $_POST["id"], PDO::PARAM_INT);
        $stmt->execute();

        $conn->commit();
        $error = false;
        $data = true;

        $subject = "👋 Account Closed - " . htmlspecialchars($comp_name);

        $current_date = date('F j, Y');
        $current_time = date('g:i A');
        $year = date('Y');
        
        $privacy_url = rtrim($baseURL, "/") . "/privacy-policy";
        $help_url = rtrim($baseURL, "/") . "/help";
        $terms_url = rtrim($baseURL, "/") . "/terms";
        $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
        $supportEmail = htmlspecialchars($comp_email ?? "support@doonneys.com");
        $supportPhone = htmlspecialchars($comp_phone ?? "");
        $compLogo = $comp_logo ?? "";

        $message = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Closure - {$brandName}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <!-- Main Container -->
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                        
                        <!-- Closure Icon -->
                        <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                            <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                <span style="font-size: 40px; color: hsl(20,85%,50%);">👋</span>
                            </div>
                        </div>
                        
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                            Account Closed
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                            Your {$brandName} account has been deactivated
                        </p>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="padding: 50px 40px;">
                        
                        <!-- Personal Greeting -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                                Dear {$user->first_name} {$user->last_name},
                            </h2>
                            <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                                We're writing to inform you about important changes to your {$brandName} account.
                            </p>
                        </div>
                        
                        <!-- Important Notice -->
                        <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                            <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px;">
                                <div style="background: hsl(350,60%,65%); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; flex-shrink: 0;">
                                    ⚠️
                                </div>
                                <div>
                                    <h3 style="color: hsl(350,60%,45%); margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                                        Important Notice
                                    </h3>
                                    <p style="color: hsl(350,60%,45%); margin: 0; font-size: 15px;">
                                        Your account has been permanently deleted from {$brandName} by the system administrator. 
                                        This action is effective immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Account Details -->
                        <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                                <span>📋</span>
                                <span>Account Details</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; @media (max-width: 600px) { grid-template-columns: 1fr; }">
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        👤
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Account Holder</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$user->first_name} {$user->last_name}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        📧
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Email Address</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$user->email}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        📅
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Closure Date</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$current_date}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        🕒
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Closure Time</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$current_time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Implications -->
                        <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                                📋 What This Means
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">🔒</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">All access to {$brandName} services has been permanently revoked</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">🗑️</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Your profile information has been removed from our systems</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">📊</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Associated data will be permanently deleted per our data retention policy</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">📧</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">You will no longer receive communications from {$brandName}</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">🚫</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Future login attempts will not be successful</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Need Help -->
                        <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                            <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                <span>❓</span>
                                <span>Need More Information?</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(210,40%,90%); text-align: center;">
                                    <div style="color: hsl(210,50%,40%); font-size: 24px; margin-bottom: 10px;">📧</div>
                                    <p style="color: hsl(210,50%,30%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Email Support</p>
                                    <a href="mailto:{$supportEmail}" style="color: hsl(210,50%,40%); text-decoration: none; font-size: 13px;">{$supportEmail}</a>
                                </div>
                                
                                <div style="text-align: center;">
                                    <p style="color: hsl(20,20%,45%); margin: 15px 0; font-size: 14px;">
                                        Our team is available to assist you during business hours if you have questions.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Data Privacy -->
                        <div style="background: linear-gradient(135deg, hsl(40,90%,97%) 0%, hsl(40,90%,94%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(40,90%,85%);">
                            <h3 style="color: hsl(40,90%,30%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                <span>🔒</span>
                                <span>Data Privacy Notice</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; @media (max-width: 600px) { grid-template-columns: 1fr; }">
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(40,90%,85%);">
                                    <div style="color: hsl(40,90%,30%); font-size: 20px; margin-bottom: 8px;">🕒</div>
                                    <p style="color: hsl(40,90%,20%); margin: 0; font-size: 13px; font-weight: 600;">30-Day Retention</p>
                                    <p style="color: hsl(40,90%,30%); margin: 5px 0 0 0; font-size: 12px;">Backups retained for compliance</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(40,90%,85%);">
                                    <div style="color: hsl(40,90%,30%); font-size: 20px; margin-bottom: 8px;">📄</div>
                                    <p style="color: hsl(40,90%,20%); margin: 0; font-size: 13px; font-weight: 600;">Policy Compliance</p>
                                    <p style="color: hsl(40,90%,30%); margin: 5px 0 0 0; font-size: 12px;">Following data protection laws</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(40,90%,85%);">
                                    <div style="color: hsl(40,90%,30%); font-size: 20px; margin-bottom: 8px;">👁️</div>
                                    <p style="color: hsl(40,90%,20%); margin: 0; font-size: 13px; font-weight: 600;">Transparent Process</p>
                                    <p style="color: hsl(40,90%,30%); margin: 5px 0 0 0; font-size: 12px;">Clear data handling procedures</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(40,90%,85%);">
                                    <div style="color: hsl(40,90%,30%); font-size: 20px; margin-bottom: 8px;">🔐</div>
                                    <p style="color: hsl(40,90%,20%); margin: 0; font-size: 13px; font-weight: 600;">Secure Deletion</p>
                                    <p style="color: hsl(40,90%,30%); margin: 5px 0 0 0; font-size: 12px;">Industry-standard secure erasure</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Closing -->
                        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                            <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                Thank you for being part of the {$brandName} community. We wish you all the best in your future beauty endeavors.
                            </p>
                            <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                                Sincerely,<br>
                                <span style="color: hsl(20,85%,50%);">The {$brandName} Team</span>
                            </p>
                        </div>
                        
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                        <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                            Account: {$user->email} • Closed: {$current_date} at {$current_time}
                        </p>
                        <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0; @media (max-width: 600px) { flex-direction: column; gap: 10px; }">
                            <a href="{$privacy_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Privacy Policy</a>
                            <a href="{$help_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Help Center</a>
                            <a href="{$terms_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Terms of Service</a>
                            <a href="mailto:{$supportEmail}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Contact Us</a>
                        </div>
                        <p style="color: hsl(30,15%,65%); margin: 10px 0 0 0; font-size: 11px;">
                            &copy; {$year} {$brandName}. All rights reserved.<br>
                            This is an automated notification of account closure.
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

        // Send email notification
        send_email($user->email, $user->first_name . " " . $user->last_name, $subject, $message);
        
        // Optional SMS notification
        if (!empty($user->mobile_number)) {
            $smsMessage = "👋 Your {$brandName} account has been permanently closed. If this was unexpected, please contact support: {$supportEmail}";
            send_sms($user->mobile_number, $smsMessage);
        }

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ]);