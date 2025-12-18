# 🚀 rentMe Authentication Quick Reference

## 📍 API Endpoints

### Local Authentication

```bash
# Register new user
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "contactNumber": "+1234567890",
  "role": "RENTER"
}

# Login
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Logout
POST http://localhost:8080/api/v1/auth/logout
```

### Google OAuth

```bash
# Google Login (called by frontend automatically)
POST http://localhost:8080/api/v1/auth/google
Content-Type: application/json

{
  "token": "google-id-token-from-frontend"
}
```

---

## 🔧 Environment Setup

### Backend (`.env`)

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/rentme
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🔑 Authentication Flow Comparison

| Feature                | Local Auth              | Google OAuth                   |
| ---------------------- | ----------------------- | ------------------------------ |
| **Registration**       | Required (`/register`)  | Auto-registered on first login |
| **Login**              | `/login` endpoint       | `/google` endpoint             |
| **Password**           | Required, stored hashed | Not needed (null)              |
| **Email Verification** | Manual (future)         | Auto-verified by Google        |
| **Profile Picture**    | User uploads            | From Google account            |
| **Auth Provider**      | LOCAL                   | GOOGLE                         |

---

## 🧪 Testing Checklist

### ✅ Local Login

- [ ] Backend running on `http://localhost:8080`
- [ ] Database connected
- [ ] Test user registered
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] JWT cookie set after login
- [ ] Can access protected routes

### ✅ Google Login

- [ ] Frontend running on `http://localhost:3000`
- [ ] Backend running on `http://localhost:8080`
- [ ] Google Client ID in both `.env` files
- [ ] Google Cloud Console configured
- [ ] Click "Sign in with Google" opens popup
- [ ] Can select Google account
- [ ] Redirects to dashboard after login
- [ ] New user auto-registered in database
- [ ] Existing user can login again

---

## 🐛 Common Issues & Fixes

### Issue: Local login returns HTML instead of JSON

**Cause:** Spring Security OAuth2 was redirecting to Google  
**Fix:** ✅ Removed OAuth2 login configuration from SecurityConfig  
**Status:** Fixed!

### Issue: "Invalid Google token"

**Cause:** Client ID mismatch between frontend and backend  
**Fix:** Use same Client ID in both `.env` and `.env.local`

### Issue: "redirect_uri_mismatch"

**Cause:** Frontend URL not in Google Console  
**Fix:** Add `http://localhost:3000` to Authorized JavaScript origins

### Issue: CORS error when calling backend

**Cause:** Frontend URL not allowed  
**Fix:** Backend already configured, check CORS config if needed

---

## 📁 Key Files

### Backend

- `AuthService.java` - Business logic for login/register
- `AuthController.java` - REST API endpoints
- `SecurityConfig.java` - Security rules
- `JwtTokenProvider.java` - JWT generation
- `JwtAuthenticationFilter.java` - JWT validation
- `User.java` - User entity with auth provider

### Frontend

- `app/login/page.tsx` - Login page UI
- `components/GoogleSignInButton.tsx` - Google OAuth button
- `app/dashboard/page.tsx` - Protected dashboard

---

## 🔐 Security Features

✅ **Passwords** - BCrypt hashed (10 rounds)  
✅ **JWT** - HTTP-only cookies (XSS protection)  
✅ **CORS** - Configured for frontend origin  
✅ **CSRF** - Disabled (stateless JWT)  
✅ **Google Tokens** - Verified server-side  
✅ **Stateless** - No server sessions  
✅ **Role-based** - ADMIN, VEHICLE_OWNER, RENTER

---

## 📚 Documentation

- [Backend Google OAuth Setup](../rentMe_backend/GOOGLE_OAUTH_SETUP.md)
- [Frontend Google OAuth Setup](./GOOGLE_OAUTH_FRONTEND_SETUP.md)
- [Authentication Design](../rentMe_backend/AUTHENTICATION_DESIGN.md)

---

## 🎯 What's Working Now

✅ Local login/register  
✅ Google OAuth login (client-side)  
✅ Auto-registration for Google users  
✅ JWT authentication  
✅ Protected routes  
✅ Cookie-based session  
✅ Role-based authorization

## 🚧 Future Enhancements

- [ ] Email verification for local accounts
- [ ] Password reset functionality
- [ ] Refresh token rotation
- [ ] Multi-factor authentication (2FA)
- [ ] Account linking (merge local + Google)
- [ ] Facebook/Apple login
