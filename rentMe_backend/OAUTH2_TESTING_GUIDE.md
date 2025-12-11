# OAuth2 Testing Guide

## Prerequisites

### 1. Google Cloud Console Setup

Before testing, ensure you have configured your Google OAuth2 credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select a project
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (if not done)
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:8080/api/v1/auth/oauth2/callback/google
   http://localhost:8080/login/oauth2/code/google
   ```
7. Copy **Client ID** and **Client Secret** to `.env` file

### 2. Environment Variables

Verify your `.env` file has:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-password
```

### 3. Database Setup

Ensure your PostgreSQL database is running and accessible:

```bash
# Test connection
psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.ytieiljefwwfofqegsiq -d postgres
```

## Testing Steps

### Step 1: Build and Start Backend

```bash
cd rentMe_backend

# Clean and build
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

**Expected Output:**

```
Started SpringrentMeApplication in X seconds
Tomcat started on port(s): 8080 (http)
```

### Step 2: Verify Backend Health

Open browser or use curl:

```bash
# Test basic endpoint
curl http://localhost:8080/api/v1/auth/test

# Expected: "Auth endpoints are working!"
```

### Step 3: Test OAuth2 Initiation

**Option A: Using Browser**

1. Open browser
2. Navigate to: `http://localhost:8080/oauth2/authorization/google`
3. You should be redirected to Google sign-in page

**Option B: Using curl** (won't work fully but shows redirect)

```bash
curl -v http://localhost:8080/oauth2/authorization/google
# Expected: 302 redirect to accounts.google.com
```

### Step 4: Complete OAuth2 Flow

1. On Google sign-in page, enter your Google credentials
2. Authorize the application (if first time)
3. After authorization, you should be redirected to:
   ```
   http://localhost:3000/oauth2/redirect?token=eyJhbGc...&userId=1&email=user@gmail.com&role=RENTER
   ```
4. If frontend is not running, you'll see connection error (this is normal for now)

### Step 5: Verify Database Entry

Check if user was created in database:

```sql
-- Connect to database
psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.ytieiljefwwfofqegsiq -d postgres

-- Check users table
SELECT
    user_id,
    full_name,
    email,
    auth_provider,
    oauth_id,
    email_verified,
    role
FROM users
WHERE auth_provider = 'GOOGLE';
```

**Expected Result:**

```
 user_id | full_name  | email            | auth_provider | oauth_id      | email_verified | role
---------+------------+------------------+---------------+---------------+----------------+--------
 1       | John Doe   | john@gmail.com   | GOOGLE        | 1234567890... | t              | RENTER
```

### Step 6: Test JWT Token

Extract the JWT token from the redirect URL and test it:

```bash
# Replace YOUR_JWT_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/v1/some-protected-endpoint
```

### Step 7: Start Frontend (Optional)

```bash
cd rentMe_frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

### Step 8: Test Complete Flow with Frontend

1. Open browser: `http://localhost:3000/login` (or wherever your login page is)
2. Click "Sign in with Google" button
3. Complete Google authentication
4. Should be redirected back to frontend with token
5. Verify you're logged in (check localStorage for `jwt_token`)

## Testing Checklist

### Backend Tests

- [ ] Server starts without errors
- [ ] `/api/v1/auth/test` endpoint works
- [ ] `/oauth2/authorization/google` redirects to Google
- [ ] OAuth2 callback processes successfully
- [ ] User is created/updated in database
- [ ] JWT token is generated
- [ ] Redirect to frontend includes token

### Database Tests

- [ ] User record created with correct `auth_provider`
- [ ] `oauth_id` is populated
- [ ] `email_verified` is set to true
- [ ] `password` field is NULL
- [ ] `role` is set correctly (RENTER by default)

### Security Tests

- [ ] Cannot access protected endpoints without token
- [ ] JWT token works for authentication
- [ ] Users cannot mix authentication providers
- [ ] Email is required from OAuth provider

### Frontend Tests (when implemented)

- [ ] Google sign-in button redirects correctly
- [ ] OAuth2 redirect page extracts token
- [ ] Token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] Authenticated API calls work

## Common Issues and Solutions

### Issue 1: redirect_uri_mismatch

**Error:** `Error 400: redirect_uri_mismatch`

**Solution:**

- Check Google Cloud Console → Credentials → OAuth 2.0 Client ID
- Ensure redirect URIs include:
  - `http://localhost:8080/api/v1/auth/oauth2/callback/google`
  - `http://localhost:8080/login/oauth2/code/google`
- URIs must match EXACTLY (including http/https, port, path)

### Issue 2: Client ID or Secret Invalid

**Error:** `invalid_client`

**Solution:**

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure no extra spaces or line breaks
- Regenerate credentials in Google Cloud Console if needed

### Issue 3: Database Connection Error

**Error:** `Connection refused` or `Authentication failed`

**Solution:**

```bash
# Test database connection
psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.ytieiljefwwfofqegsiq -d postgres

# Check environment variables
echo $SPRING_DATASOURCE_URL
echo $SPRING_DATASOURCE_USERNAME
echo $SPRING_DATASOURCE_PASSWORD
```

### Issue 4: Email Not Found Error

**Error:** `Email not found from OAuth2 provider`

**Solution:**

- Ensure Google OAuth scope includes `email`
- Check `application.properties`:
  ```properties
  spring.security.oauth2.client.registration.google.scope=profile,email
  ```
- Verify OAuth consent screen has email scope enabled

### Issue 5: User Not Found After OAuth2 Login

**Error:** `User not found after OAuth2 login`

**Solution:**

- Check `CustomOAuth2UserService` is being called
- Add logging to see user creation process:
  ```java
  System.out.println("Creating user: " + oAuth2UserInfo.getEmail());
  ```
- Check database logs for any constraint violations

### Issue 6: Frontend Not Receiving Token

**Error:** Frontend shows "token is null"

**Solution:**

- Verify `FRONTEND_URL` in `.env` matches frontend URL
- Check browser network tab for redirect URL
- Ensure OAuth2LoginSuccessHandler is executing
- Add logging to see redirect URL:
  ```java
  System.out.println("Redirecting to: " + redirectUrl);
  ```

### Issue 7: CORS Errors

**Error:** `Cross-Origin Request Blocked`

**Solution:**
Add CORS configuration to `SecurityConfig.java`:

```java
http.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

## Manual Testing Scenarios

### Scenario 1: New User Registration via OAuth

1. Use Google account that hasn't registered before
2. Complete OAuth flow
3. Verify:
   - New user created in database
   - Role is RENTER
   - Email verified is true
   - Profile picture URL saved

### Scenario 2: Existing User Login via OAuth

1. Use Google account that has already registered
2. Complete OAuth flow
3. Verify:
   - No duplicate user created
   - User details updated (name, picture)
   - JWT token generated
   - Can access protected endpoints

### Scenario 3: Mixed Authentication Prevention

1. Register with local account (email/password)
2. Try to login with Google using same email
3. Should receive error: "You're already registered with LOCAL. Please use that account to login."

### Scenario 4: Token Authentication

1. Complete OAuth flow and get JWT token
2. Use token to access protected endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8080/api/v1/protected-endpoint
   ```
3. Should receive successful response

### Scenario 5: Token Expiration

1. Wait for token to expire (24 hours by default)
2. Try to access protected endpoint
3. Should receive 401 Unauthorized

## Logs to Monitor

### Successful OAuth Flow Logs

```
Processing OAuth2 user: john@gmail.com
Creating new user with provider: GOOGLE
User saved with ID: 1
Generating JWT token for: john@gmail.com
Redirecting to: http://localhost:3000/oauth2/redirect?token=...
```

### Error Logs to Watch For

```
Email not found from OAuth2 provider
User not found after OAuth2 login
redirect_uri_mismatch
invalid_client
Connection refused
Authentication failed
```

## Performance Testing

### Load Testing OAuth Flow

```bash
# Test multiple concurrent OAuth requests
for i in {1..10}; do
  curl -s http://localhost:8080/oauth2/authorization/google &
done
wait
```

### Database Query Performance

```sql
-- Check query performance for user lookup
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@gmail.com';

-- Should use index on email column
-- Execution time should be < 1ms
```

## Security Audit Checklist

- [ ] JWT secret is strong and stored in environment variables
- [ ] HTTPS is used in production (not localhost)
- [ ] CSRF protection is enabled for non-stateless endpoints
- [ ] OAuth2 state parameter is validated (handled by Spring)
- [ ] User input is validated and sanitized
- [ ] SQL injection prevention (JPA handles this)
- [ ] Password field is NULL for OAuth users
- [ ] Email verification is enforced for local users
- [ ] Rate limiting is implemented (TODO)
- [ ] Logging doesn't expose sensitive data

## Next Steps After Successful Testing

1. ✅ OAuth2 backend working
2. 🔜 Implement frontend OAuth2 pages
3. 🔜 Add error handling and user feedback
4. 🔜 Implement token refresh mechanism
5. 🔜 Add logout functionality
6. 🔜 Add profile management for OAuth users
7. 🔜 Configure production OAuth2 URLs
8. 🔜 Add monitoring and analytics
9. 🔜 Implement additional OAuth providers (Facebook, GitHub)
10. 🔜 Add rate limiting and security hardening

## Support

For issues or questions:

- Check `OAUTH2_IMPLEMENTATION_GUIDE.md` for detailed documentation
- Review Spring Security logs in console
- Check Google Cloud Console logs
- Test database connectivity independently
- Verify all environment variables are set

---

**Happy Testing! 🚀**
