# Frontend Google OAuth Setup Guide

## ✅ What Changed

We updated the frontend to use **modern client-side Google OAuth** instead of server-side redirects.

### Old Flow (Removed):

```
User clicks button → Redirect to backend → Backend redirects to Google → Login → Redirect back
```

### New Flow (Implemented):

```
User clicks button → Google popup appears → Login → Token sent to backend API → Success!
```

---

## 📋 Setup Steps

### 1. **Get Your Google Client ID**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID**
5. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

### 2. **Configure Authorized Origins**

In Google Cloud Console, under your OAuth client:

**Authorized JavaScript origins:**

- `http://localhost:3000`
- `http://localhost:8080`
- Your production frontend URL (e.g., `https://rentme.com`)

**Authorized redirect URIs:**

- `http://localhost:3000` (for local development)
- Your production URL

### 3. **Update Frontend Environment Variables**

Edit `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8080
```

⚠️ **IMPORTANT:**

- Use the **same Client ID** in both frontend (`.env.local`) and backend (`.env`)
- The Client ID is safe to expose in frontend (it's public)
- Never expose the Client Secret in frontend

### 4. **Start the Frontend**

```bash
cd rentMe_frontend
npm run dev
```

---

## 🔄 How It Works

### **Component Flow:**

1. **`GoogleSignInButton.tsx` loads:**

   - Dynamically loads Google Identity Services SDK
   - Initializes with your Client ID
   - Sets up callback function

2. **User clicks "Sign in with Google":**

   - Google One Tap popup appears
   - User selects Google account
   - User authorizes the app

3. **Google returns ID token:**

   - Token contains user info (email, name, picture)
   - Token is cryptographically signed by Google

4. **Frontend sends token to backend:**

   ```typescript
   POST http://localhost:8080/api/v1/auth/google
   Body: { "token": "google-id-token-here" }
   ```

5. **Backend verifies and processes:**

   - Verifies token with Google
   - Creates/updates user in database
   - Returns JWT token
   - Sets HTTP-only cookie

6. **Redirect to dashboard:**
   - User is now authenticated
   - Can access protected routes

---

## 🧪 Testing

### **Test Local Login (should work now):**

```bash
# Using Postman
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# Should return:
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "email": "test@example.com",
  "role": "RENTER"
}
```

### **Test Google Login:**

1. Open browser: `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Select Google account
4. Authorize the app
5. Should redirect to dashboard

---

## 🔍 Debugging

### **Check Browser Console:**

```javascript
// Should see:
"Google login successful: { userId: 1, email: '...', role: 'RENTER' }";
```

### **Check Network Tab:**

1. Look for request to `/api/v1/auth/google`
2. Check request payload has `{ token: "..." }`
3. Check response is 200 OK

### **Common Issues:**

#### ❌ "Google Sign-In not loaded yet"

**Solution:** Wait 2-3 seconds and try again, or refresh page

#### ❌ "Invalid Google token"

**Solution:** Check Client IDs match in frontend and backend

#### ❌ "redirect_uri_mismatch"

**Solution:** Add `http://localhost:3000` to Authorized JavaScript origins

#### ❌ CORS errors

**Solution:** Backend already has CORS configured for `http://localhost:3000`

---

## 📁 Updated Files

### Frontend:

- ✅ `components/GoogleSignInButton.tsx` - Modern client-side OAuth
- ✅ `.env.local` - Environment variables
- ✅ `app/login/page.tsx` - Already correct (no changes needed)

### Backend:

- ✅ `SecurityConfig.java` - Removed OAuth2 login configuration
- ✅ `AuthService.googleLogin()` - Handles token verification
- ✅ `AuthController.java` - `/api/v1/auth/google` endpoint

---

## 🎯 Summary

**Before:** Backend handled OAuth flow with redirects (broke REST API)

**After:** Frontend handles OAuth with popup, sends token to REST API

**Benefits:**

- ✅ Works with REST API architecture
- ✅ No page redirects during login
- ✅ Better user experience (popup vs full redirect)
- ✅ Stateless JWT authentication
- ✅ Same flow for mobile apps
- ✅ Auto-registration for new users

---

## 🚀 Next Steps

1. Update `.env.local` with your Google Client ID
2. Restart frontend: `npm run dev`
3. Test local login (should work now!)
4. Test Google login
5. Deploy and update production URLs in Google Console
