# 🚀 Quick Start - Test OAuth2 in 5 Minutes

## Prerequisites ✅

- [ ] Google OAuth credentials created
- [ ] `.env` file configured
- [ ] Backend dependencies installed (`mvnw` present)
- [ ] Frontend dependencies installed (`npm install` done)

---

## Step-by-Step Testing

### 1️⃣ Start Backend (Terminal 1)

```powershell
cd "c:\rentME\rentMe vehicle rental platform\rentMe\rentMe_backend"
.\mvnw spring-boot:run
```

**Wait for**: `Started SpringrentMeApplication`

---

### 2️⃣ Start Frontend (Terminal 2)

```powershell
cd "c:\rentME\rentMe vehicle rental platform\rentMe\rentMe_frontend"
npm run dev
```

**Wait for**: `Ready started server on 0.0.0.0:3000`

---

### 3️⃣ Open Login Page

**Browser**: http://localhost:3000/login

**Should see**:

```
┌────────────────────────────────────┐
│      Sign in to rentMe              │
│  Welcome back! Please sign in...   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  🔵 Sign in with Google      │  │ ← Click this!
│  └──────────────────────────────┘  │
│                                     │
│    Or continue with email          │
│  ─────────────────────────────────  │
│                                     │
│  Email: [___________________]      │
│  Password: [___________________]   │
│                                     │
│  [ Sign in ]                       │
└────────────────────────────────────┘
```

---

### 4️⃣ Click "Sign in with Google"

**What happens**:

```
Your Browser → Google Login Page
             → Sign in with Google account
             → Approve permissions
             → Processing Login... (1 second)
             → Dashboard! ✅
```

---

### 5️⃣ Verify Success

**Dashboard should show**:

```
┌─────────────────────────────────────────────┐
│ rentMe              your@gmail.com [Logout] │
├─────────────────────────────────────────────┤
│                                             │
│  🎉 Welcome to rentMe Dashboard!           │
│  You have successfully logged in using     │
│  OAuth2 Google authentication.             │
│                                             │
│  ✅ Authentication successful!              │
│                                             │
│  Your Account Information                  │
│  ─────────────────────────                 │
│  User ID: 1                                │
│  Email: your@gmail.com                     │
│  Role: RENTER                              │
│  Authentication: Google OAuth2             │
│                                             │
│  ✅ OAuth2 Testing Complete                │
│  • Backend OAuth2 configuration working    │
│  • Google authentication successful        │
│  • User created/updated in database        │
│  • JWT token generated and stored          │
│  • Frontend redirect handler working       │
│  • Protected route access granted          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Success Indicators

### Browser (Press F12 → Console)

```javascript
OAuth2 login successful: {userId: "1", email: "your@gmail.com", role: "RENTER"}
```

### Local Storage (F12 → Application → Local Storage)

```
jwt_token: "eyJhbGciOiJIUzI1NiJ9..."
user_id: "1"
user_email: "your@gmail.com"
user_role: "RENTER"
```

### Database

```sql
SELECT * FROM users WHERE auth_provider = 'GOOGLE';
```

**Result**:

```
user_id │ full_name │ email           │ auth_provider │ oauth_id   │ email_verified │ role
────────┼───────────┼─────────────────┼───────────────┼────────────┼────────────────┼────────
   1    │ Your Name │ your@gmail.com  │ GOOGLE        │ 1234567890 │ true           │ RENTER
```

---

## ❌ Common Issues & Quick Fixes

### Issue: "redirect_uri_mismatch"

**Fix**: Add to Google Cloud Console:

```
http://localhost:8080/api/v1/auth/oauth2/callback/google
```

### Issue: "This site can't be reached"

**Fix**: Make sure frontend is running:

```powershell
npm run dev
```

### Issue: Backend won't start

**Fix**: Kill port 8080:

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Issue: Frontend won't start

**Fix**: Install dependencies:

```powershell
npm install
```

---

## 📁 Files You Need (Already Created!)

✅ Backend:

- `SecurityConfig.java` - OAuth2 configuration
- `CustomOAuth2UserService.java` - User processing
- `OAuth2LoginSuccessHandler.java` - JWT generation
- `GoogleOAuth2UserInfo.java` - Data extraction
- `application.properties` - OAuth2 settings
- `.env` - Google credentials

✅ Frontend:

- `app/login/page.tsx` - Login page with Google button
- `app/oauth2/redirect/page.tsx` - Redirect handler
- `app/dashboard/page.tsx` - Protected dashboard
- `components/GoogleSignInButton.tsx` - Reusable button

---

## 🎯 What You're Testing

1. **OAuth2 Flow**: User → Google → Backend → Database → Frontend
2. **User Creation**: New users automatically registered
3. **JWT Generation**: Tokens created for authentication
4. **Frontend Integration**: Token storage and redirect
5. **Protected Routes**: Dashboard requires authentication

---

## ⏱️ Timeline

- **0:00** - Start backend (`.\mvnw spring-boot:run`)
- **0:30** - Backend ready
- **0:30** - Start frontend (`npm run dev`)
- **0:45** - Frontend ready
- **0:45** - Open http://localhost:3000/login
- **1:00** - Click "Sign in with Google"
- **1:15** - Complete Google sign-in
- **1:30** - Land on dashboard
- **1:30** - ✅ SUCCESS!

**Total time**: ~90 seconds from start to authenticated! 🚀

---

## 🎊 You're Done!

If you see the dashboard with your user info, **congratulations!**

Your OAuth2 implementation is fully functional and production-ready (after adding HTTPS for production).

---

**Need more details?** See: `TESTING_OAUTH2_COMPLETE.md`
