# 🧪 OAuth2 Testing Guide - Complete Instructions

## ✅ What's Already Implemented

### Backend (100% Complete)

- ✅ OAuth2 dependencies added
- ✅ Security configuration updated
- ✅ Custom OAuth2 user service created
- ✅ Success handler implemented
- ✅ User info extraction (Google)
- ✅ JWT token generation

### Frontend (100% Complete)

- ✅ OAuth2 redirect handler: `app/oauth2/redirect/page.tsx`
- ✅ Google sign-in button: `components/GoogleSignInButton.tsx`
- ✅ Login page: `app/login/page.tsx`
- ✅ Dashboard page: `app/dashboard/page.tsx`

---

## 🚀 Complete Testing Process

### Step 1: Verify Google Cloud Console Configuration

1. Go to: https://console.cloud.google.com/
2. Navigate to: **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Verify **Authorized redirect URIs** include:
   ```
   http://localhost:8080/api/v1/auth/oauth2/callback/google
   http://localhost:8080/login/oauth2/code/google
   ```
5. If missing, add them and click **Save**

### Step 2: Verify Environment Variables

Check your `.env` file has:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start Backend

```powershell
# Open Terminal 1
cd "c:\rentME\rentMe vehicle rental platform\rentMe\rentMe_backend"

# Start backend
.\mvnw spring-boot:run
```

**Wait for**: `Started SpringrentMeApplication in X.XXX seconds`

### Step 4: Start Frontend

```powershell
# Open Terminal 2
cd "c:\rentME\rentMe vehicle rental platform\rentMe\rentMe_frontend"

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

**Wait for**: `Ready started server on 0.0.0.0:3000, url: http://localhost:3000`

### Step 5: Test OAuth2 Flow

#### Option A: Test from Login Page (Recommended)

1. Open browser: **http://localhost:3000/login**
2. You should see:

   - "Sign in to rentMe" heading
   - **"Sign in with Google"** button with Google logo
   - Email/password form below

3. Click **"Sign in with Google"** button

4. You'll be redirected to Google login page

5. Sign in with your Google account

6. Google will ask: "rentMe wants to access your Google Account"

   - Click **"Continue"** or **"Allow"**

7. You'll be redirected back to: **http://localhost:3000/oauth2/redirect**

   - You should see: "Processing Login..." with spinner

8. After ~1 second, you'll be redirected to: **http://localhost:3000/dashboard**

9. ✅ **Success!** You should see:
   - Your email displayed in the header
   - "Welcome to rentMe Dashboard!" message
   - Your user information (User ID, Email, Role)
   - "OAuth2 Testing Complete" section

#### Option B: Test Backend Only (Quick)

1. Open browser: **http://localhost:8080/oauth2/authorization/google**
2. Sign in with Google
3. You'll be redirected to frontend (may see error if frontend not running)
4. Check database to verify user was created

---

## 🔍 Verification Steps

### 1. Check Browser Console (F12)

**Expected logs**:

```
OAuth2 login successful: {userId: "1", email: "your@gmail.com", role: "RENTER"}
```

### 2. Check Local Storage

**F12 → Application → Local Storage → http://localhost:3000**

Should contain:

- `jwt_token`: Long string starting with "eyJ..."
- `user_id`: "1" (or another number)
- `user_email`: Your Google email
- `user_role`: "RENTER"

### 3. Check Database

```powershell
# Connect to PostgreSQL
psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.ytieiljefwwfofqegsiq -d postgres
```

```sql
-- View all OAuth users
SELECT
    user_id,
    full_name,
    email,
    auth_provider,
    oauth_id,
    email_verified,
    role,
    profile_picture,
    created_at
FROM users
WHERE auth_provider = 'GOOGLE'
ORDER BY created_at DESC;
```

**Expected result**:

```
 user_id |   full_name   |       email        | auth_provider |  oauth_id   | email_verified |  role  |         profile_picture          |      created_at
---------+---------------+--------------------+---------------+-------------+----------------+--------+----------------------------------+---------------------
       1 | Your Name     | your@gmail.com     | GOOGLE        | 1234567890  | t              | RENTER | https://lh3.googleusercontent... | 2025-12-11 10:30:00
```

### 4. Check Backend Logs

**Look for these log messages**:

```
✅ Processing OAuth2 user: your@gmail.com
✅ Creating new OAuth2 user
✅ User saved with ID: 1
✅ JWT token generated
✅ Redirecting to: http://localhost:3000/oauth2/redirect?token=...
```

---

## 🧪 Test Scenarios

### Scenario 1: First-Time User

**Steps**:

1. Use a Google account that has never logged in to rentMe
2. Click "Sign in with Google"
3. Sign in with Google
4. Approve permissions

**Expected Result**:

- ✅ New user created in database
- ✅ `auth_provider` = 'GOOGLE'
- ✅ `email_verified` = true
- ✅ `password` = NULL
- ✅ `role` = 'RENTER' (default)
- ✅ Redirected to dashboard

### Scenario 2: Returning OAuth User

**Steps**:

1. Use the same Google account from Scenario 1
2. Click "Sign in with Google" again
3. Sign in (Google may skip this if already logged in)

**Expected Result**:

- ✅ Existing user found in database
- ✅ User info updated (name, profile picture)
- ✅ Same user_id as before
- ✅ Redirected to dashboard

### Scenario 3: Mixed Authentication (Should Fail)

**Setup**: Create a local user with same email

```sql
-- Run in database
INSERT INTO users (full_name, email, password, auth_provider, role, contact_number, email_verified, is_active)
VALUES ('Test User', 'your@gmail.com', '$2a$10$abcdef...', 'LOCAL', 'RENTER', '1234567890', false, true);
```

**Steps**:

1. Try to sign in with Google using 'your@gmail.com'

**Expected Result**:

- ❌ Error: "You're already registered with LOCAL. Please use that account to login."
- ✅ User is NOT logged in
- ✅ Database record remains unchanged

### Scenario 4: Logout and Re-login

**Steps**:

1. On dashboard, click **"Logout"** button
2. Verify redirected to login page
3. Click "Sign in with Google" again

**Expected Result**:

- ✅ Local storage cleared
- ✅ Redirected to login page
- ✅ Can log in again with Google
- ✅ Redirected to dashboard

### Scenario 5: Direct URL Access (Protected Route)

**Steps**:

1. Logout if logged in
2. Try to directly access: **http://localhost:3000/dashboard**

**Expected Result**:

- ✅ Redirected to login page (no token found)

---

## 🐛 Troubleshooting

### Issue 1: "redirect_uri_mismatch" Error

**Symptom**: Google shows error page

**Solution**:

1. Go to Google Cloud Console
2. Add exact redirect URI: `http://localhost:8080/api/v1/auth/oauth2/callback/google`
3. Wait 5 minutes for changes to propagate
4. Try again

### Issue 2: "This site can't be reached" after Google login

**Symptom**: Redirects to `http://localhost:3000` but shows error

**Solution**:

- Make sure frontend is running on port 3000
- Check `.env` has: `FRONTEND_URL=http://localhost:3000`
- Restart backend if you changed `.env`

### Issue 3: "User not found after OAuth2 login"

**Symptom**: Error message after Google authentication

**Solution**:

- Check database connection is working
- Verify `CustomOAuth2UserService` is saving users
- Check backend logs for SQL errors

### Issue 4: Spinner keeps spinning on redirect page

**Symptom**: Stuck on "Processing Login..." page

**Solution**:

- Open browser console (F12)
- Check for JavaScript errors
- Verify token is in URL: `?token=...`
- Check local storage (F12 → Application → Local Storage)

### Issue 5: Backend not starting

**Symptom**: Maven errors or port already in use

**Solution**:

```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart backend
.\mvnw spring-boot:run
```

---

## 📊 Success Checklist

After testing, you should have:

### Backend Verification

- [ ] Backend starts without errors
- [ ] OAuth2 endpoints are accessible
- [ ] Google login redirects work
- [ ] User is created in database
- [ ] JWT token is generated
- [ ] Redirect to frontend works

### Frontend Verification

- [ ] Frontend starts without errors
- [ ] Login page displays correctly
- [ ] Google button works
- [ ] Redirect handler processes token
- [ ] Token stored in local storage
- [ ] Dashboard displays user info
- [ ] Logout works

### Database Verification

- [ ] Users table has new record
- [ ] `auth_provider` = 'GOOGLE'
- [ ] `oauth_id` is populated
- [ ] `email_verified` = true
- [ ] `password` = NULL
- [ ] Profile picture URL stored

### Security Verification

- [ ] JWT token is valid
- [ ] Token contains correct claims
- [ ] Protected routes require authentication
- [ ] Logout clears authentication
- [ ] Mixed auth providers prevented

---

## 🎯 Next Steps After Testing

Once OAuth2 is working:

1. **Add to Home Page**: Add Google sign-in button to main page
2. **Styling**: Customize button colors to match your brand
3. **Error Handling**: Add better error messages
4. **Loading States**: Add loading indicators
5. **Profile Page**: Show OAuth user's profile picture
6. **Production Config**: Update redirect URIs for production
7. **Add More Providers**: Facebook, GitHub, etc.

---

## 📞 Getting Help

If something doesn't work:

1. Check backend logs (Terminal 1)
2. Check browser console (F12)
3. Check database records
4. Review the error message carefully
5. Compare with expected results above

---

## 🎉 Expected Final Result

**When everything works**:

1. User clicks "Sign in with Google" on login page
2. Redirects to Google → User signs in → Redirects back
3. Shows "Processing Login..." for ~1 second
4. Lands on dashboard showing:
   - Welcome message
   - User information
   - Success indicators
5. Database has new user record with Google data
6. User can navigate the app with authentication

**Congratulations! Your OAuth2 implementation is complete and working!** 🎊
