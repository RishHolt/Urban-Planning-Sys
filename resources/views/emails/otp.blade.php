<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h1 style="color: #2563eb; margin-top: 0;">Verification Code</h1>
        
        <p>Hello,</p>
        
        <p>You have requested a verification code for {{ $typeLabel }}. Please use the code below:</p>
        
        <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h2 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                {{ $code }}
            </h2>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> This code will expire in {{ $expiryMinutes }} minutes. Do not share this code with anyone.
        </p>
        
        <p>If you did not request this code, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; margin-bottom: 0;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
