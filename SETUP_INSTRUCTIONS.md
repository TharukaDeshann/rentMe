# 🎯 Complete Setup Instructions

Follow these steps to set up and run the rentMe application with Google OAuth.

---

## 📋 Prerequisites

- ✅ Java 21
- ✅ Node.js 18+ and npm
- ✅ PostgreSQL database
- ✅ Google Cloud account

---

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**

### 1.2 Configure OAuth Consent Screen

1. Click **Configure Consent Screen**
2. Select **External** user type
3. Fill in:
   - App name: `rentMe`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`
5. Save and continue

### 1.3 Configure OAuth Client

1. Application type: **Web application**
2. Name: `rentMe OAuth Client`
3. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:8080`
4. **Authorized redirect URIs:**
   - `http://localhost:3000`
5. Click **Create**
6. **Copy Client ID and Client Secret** - you'll need these!

---

## 🗄️ Step 2: Database Setup

### 2.1 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rentme;

# Exit
\q
```

### 2.2 Configure Backend

Create `rentMe_backend/.env` file:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/rentme
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_postgres_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth (paste your credentials here)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789jkl
```

⚠️ **Replace with your actual Google credentials!**

---

## 💻 Step 3: Backend Setup

```bash
# Navigate to backend
cd rentMe_backend

# Clean and build
./mvnw clean install

# Run application
./mvnw spring-boot:run
```

**Backend should start on:** `http://localhost:8080`

**Verify it's running:**

```bash
curl http://localhost:8080/api/v1/auth/test
# Should return: "Auth endpoints are working!"
```

---

## 🎨 Step 4: Frontend Setup

### 4.1 Configure Frontend

Create `rentMe_frontend/.env.local` file:

```env
# Google OAuth (use SAME Client ID as backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
```

⚠️ **IMPORTANT:** Use the **SAME** Client ID as in backend `.env`!

### 4.2 Install and Run

```bash
# Navigate to frontend
cd rentMe_frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Frontend should start on:** `http://localhost:3000`

---

## 🧪 Step 5: Test Everything

### 5.1 Test Local Login

1. **Create a test user** (using Postman or curl):

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "contactNumber": "+1234567890",
    "role": "RENTER"
  }'
```

2. **Login via browser:**
   - Go to `http://localhost:3000/login`
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click **Sign in**
   - Should redirect to dashboard ✅

### 5.2 Test Google Login

1. **Go to login page:**

   - Open `http://localhost:3000/login`

2. **Click "Sign in with Google"**

   - Google popup should appear
   - Select your Google account
   - Authorize the app

3. **Check result:**
   - Should redirect to dashboard ✅
   - Check database - new user should be created with `GOOGLE` auth provider

### 5.3 Verify in Database

```sql
-- Connect to database
psql -U postgres -d rentme

-- Check users
SELECT user_id, full_name, email, auth_provider, email_verified
FROM users;

-- Should see:
-- 1 | Test User | test@example.com | LOCAL | false
-- 2 | Your Name | your@gmail.com   | GOOGLE | true
```

---

## ✅ Verification Checklist

### Backend

- [ ] PostgreSQL database created and running
- [ ] Backend `.env` file configured
- [ ] Backend starts without errors on port 8080
- [ ] `/api/v1/auth/test` endpoint returns success

### Frontend

- [ ] Frontend `.env.local` file configured
- [ ] Same Google Client ID in both backend and frontend
- [ ] Frontend starts without errors on port 3000
- [ ] Can access login page at `http://localhost:3000/login`

### Google OAuth

- [ ] OAuth client created in Google Console
- [ ] JavaScript origins include `http://localhost:3000`
- [ ] Client ID copied to both `.env` files
- [ ] Client Secret copied to backend `.env` only

### Authentication

- [ ] Can register new local user via API
- [ ] Can login with local credentials
- [ ] Can click "Sign in with Google" (popup appears)
- [ ] Can authenticate with Google account
- [ ] Redirects to dashboard after login
- [ ] New Google users auto-created in database

---

## 🐛 Troubleshooting

### Problem: Backend won't start

**Check:**

- Is PostgreSQL running? (`psql -U postgres`)
- Is database created? (`\l` in psql)
- Are credentials correct in `.env`?

### Problem: "Invalid Google token"

**Solution:**

- Verify Client IDs match in both `.env` files
- Check Google Console credentials are correct
- Try regenerating OAuth client

### Problem: "redirect_uri_mismatch"

**Solution:**

- Add `http://localhost:3000` to Google Console **Authorized JavaScript origins**
- Wait 5 minutes for Google's cache to update
- Try again

### Problem: Local login returns HTML instead of JSON

**Solution:**

- ✅ Already fixed! SecurityConfig updated to remove OAuth2 redirect
- Restart backend if still seeing issue

### Problem: CORS errors in browser console

**Solution:**

- Backend CORS already configured for `http://localhost:3000`
- Check `CorsConfig.java` if issues persist
- Verify frontend is running on port 3000

---

## 🎉 Success!

If all tests pass, you now have:

✅ Working local authentication  
✅ Working Google OAuth login  
✅ Auto-registration for Google users  
✅ JWT-based session management  
✅ Protected dashboard route  
✅ Modern client-side OAuth flow

---

## 📚 Next Steps

1. **Read the documentation:**

   - [Authentication Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md)
   - [Backend Google Setup](./rentMe_backend/GOOGLE_OAUTH_SETUP.md)
   - [Frontend Google Setup](./rentMe_frontend/GOOGLE_OAUTH_FRONTEND_SETUP.md)

2. **Explore the features:**

   - Try logging out and logging back in
   - Create multiple users
   - Check the dashboard

3. **Continue development:**
   - Add email verification
   - Implement password reset
   - Add more protected routes
   - Deploy to production

---

## 🆘 Need Help?

- Check console logs (browser and backend)
- Review network requests in browser DevTools
- Check database for created users
- Verify all environment variables are set
- Ensure ports 3000, 8080, and 5432 are not blocked

**Common port check:**

```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :5432
```
