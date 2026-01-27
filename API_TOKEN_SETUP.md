# API Token Authentication Setup

This guide explains how to set up and use API token authentication for the Entry/Exit Events API.

## Quick Setup

### 1. Add Token to `.env` File

Add one of the following to your `.env` file:

**Option A: Single Token**
```env
API_TOKEN=your-secret-token-here
```

**Option B: Multiple Tokens (comma-separated)**
```env
API_TOKENS=token1,token2,token3
```

### 2. Generate a Secure Token

You can generate a secure token using:

```bash
# Using PHP
php -r "echo bin2hex(random_bytes(32));"

# Using OpenSSL
openssl rand -hex 32

# Using Laravel Tinker
php artisan tinker
>>> bin2hex(random_bytes(32))
```

### 3. Restart Your Server

After updating `.env`, restart your Laravel server:

```bash
# Stop current server (Ctrl+C)
# Then restart
php artisan serve
```

## Testing the API

### Test Without Token (Should Fail)

```bash
curl -X POST http://localhost:8000/api/events/entry-exit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "entry",
    "person_id": 1,
    "timestamp": 1737991800000,
    "device_id": "test-device"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### Test With Token (Should Succeed)

```bash
curl -X POST http://localhost:8000/api/events/entry-exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '{
    "type": "entry",
    "person_id": 1,
    "timestamp": 1737991800000,
    "device_id": "test-device"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event recorded successfully",
  "data": {
    "id": 1,
    "type": "entry",
    ...
  }
}
```

## Android App Configuration

In your Android app, set the token using the "Set Token" button:

1. Open the app
2. Click "Set Token" button
3. Enter your token (e.g., `your-secret-token-here`)
4. Click "Save"

The app will automatically include the token in all API requests as:
```
Authorization: Bearer your-secret-token-here
```

## Production Recommendations

### 1. Use Environment-Specific Tokens

```env
# .env (development)
API_TOKEN=dev-token-123

# .env.production (production)
API_TOKEN=prod-secure-token-xyz
```

### 2. Rotate Tokens Regularly

- Generate new tokens periodically
- Update `.env` file
- Update Android app configuration
- Revoke old tokens

### 3. Use Database-Backed Tokens (Advanced)

For production, you can upgrade to database-backed tokens:

1. Create an `api_tokens` table
2. Update `VerifyApiToken` middleware to check database
3. Implement token management UI

Example migration:
```php
Schema::create('api_tokens', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('token', 64)->unique();
    $table->boolean('is_active')->default(true);
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();
});
```

## Troubleshooting

### Issue: "No token provided"
- **Solution**: Ensure your Android app is sending the `Authorization: Bearer <token>` header

### Issue: "Invalid token"
- **Solution**: 
  - Check that the token in `.env` matches the token in your Android app
  - Ensure there are no extra spaces or characters
  - Restart the Laravel server after updating `.env`

### Issue: Token works in Postman but not in Android app
- **Solution**: 
  - Check Android app logs for the exact Authorization header being sent
  - Verify the token format (should be `Bearer <token>`)
  - Ensure the token is being saved correctly in SharedPreferences

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Use strong, randomly generated tokens
- Rotate tokens regularly
- Use HTTPS in production
- Consider implementing token expiration
- Monitor token usage for suspicious activity
