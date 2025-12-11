# OAuth2 Flow Diagram

## Complete Authentication Flow

```
┌─────────────┐                                    ┌──────────────┐
│   Browser   │                                    │    Google    │
│  (Frontend) │                                    │   OAuth2     │
└──────┬──────┘                                    └──────┬───────┘
       │                                                  │
       │  1. Click "Sign in with Google"                 │
       │     GET /oauth2/authorization/google            │
       ├────────────────────────────────────┐            │
       │                                    │            │
       │                                    ▼            │
       │                            ┌─────────────────┐  │
       │                            │  Spring Boot    │  │
       │                            │   Backend       │  │
       │                            │  Port 8080      │  │
       │                            └────────┬────────┘  │
       │                                     │           │
       │  2. Redirect to Google              │           │
       │     (with client_id, redirect_uri)  │           │
       │◄────────────────────────────────────┤           │
       │                                     │           │
       │  3. User authenticates              │           │
       ├─────────────────────────────────────┼──────────►│
       │     (enters credentials)            │           │
       │                                     │           │
       │  4. Authorization code callback     │           │
       │     (code=xxx, state=yyy)           │           │
       │─────────────────────────────────────┼──────────►│
       │                                     │           │
       │                                     │  5. Exchange code
       │                                     │     for token
       │                                     ├──────────►│
       │                                     │           │
       │                                     │  6. Token + User Info
       │                                     │◄──────────┤
       │                                     │           │
       │                                     ▼           │
       │                            ┌─────────────────┐  │
       │                            │ CustomOAuth2    │  │
       │                            │ UserService     │  │
       │                            │ - Process user  │  │
       │                            │ - Save to DB    │  │
       │                            └────────┬────────┘  │
       │                                     │           │
       │                                     ▼           │
       │                            ┌─────────────────┐  │
       │                            │ OAuth2Login     │  │
       │                            │ SuccessHandler  │  │
       │                            │ - Generate JWT  │  │
       │                            └────────┬────────┘  │
       │                                     │           │
       │  7. Redirect with JWT token         │           │
       │     /oauth2/redirect?token=xxx      │           │
       │◄────────────────────────────────────┤           │
       │                                     │           │
       │  8. Store token & redirect          │           │
       │     to dashboard                    │           │
       │                                     │           │
       ▼                                     │           │
   Dashboard                                 │           │
   (Authenticated)                           │           │
                                            │           │
```

## Component Interaction Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                        Spring Boot Backend                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                     SecurityConfig                        │ │
│  │  - Configures OAuth2 login                                │ │
│  │  - Sets up JWT filter                                     │ │
│  │  - Defines public/protected endpoints                     │ │
│  └────────────────┬─────────────────────────────────────────┘ │
│                   │                                            │
│                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           CustomOAuth2UserService                         │ │
│  │  1. Receives OAuth2 user data from Google                 │ │
│  │  2. Extracts email, name, picture using factory           │ │
│  │  3. Checks if user exists in database                     │ │
│  │  4. Creates new user OR updates existing user             │ │
│  │  5. Returns UserDetailsImpl with OAuth2 attributes        │ │
│  └────────────────┬─────────────────────────────────────────┘ │
│                   │                                            │
│                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            OAuth2LoginSuccessHandler                      │ │
│  │  1. Receives authenticated user                           │ │
│  │  2. Generates JWT token using JwtTokenProvider            │ │
│  │  3. Builds redirect URL with token & user info            │ │
│  │  4. Redirects to frontend                                 │ │
│  └────────────────┬─────────────────────────────────────────┘ │
│                   │                                            │
└───────────────────┼────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Frontend Redirect   │
        │   /oauth2/redirect    │
        │  - Extracts token     │
        │  - Stores in storage  │
        │  - Redirects to app   │
        └───────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        users table                           │
├──────────────┬──────────────┬───────────────────────────────┤
│ Column       │ Type         │ Description                   │
├──────────────┼──────────────┼───────────────────────────────┤
│ user_id      │ BIGSERIAL    │ Primary key                   │
│ full_name    │ VARCHAR(100) │ User's full name              │
│ email        │ VARCHAR(100) │ Email (unique)                │
│ password     │ VARCHAR(255) │ NULL for OAuth users          │
│ auth_provider│ VARCHAR      │ LOCAL / GOOGLE / FACEBOOK     │
│ oauth_id     │ VARCHAR      │ Provider's user ID (unique)   │
│ email_verified│ BOOLEAN     │ Auto-true for OAuth           │
│ role         │ VARCHAR      │ RENTER / OWNER / ADMIN        │
│ profile_picture│ VARCHAR   │ URL to profile pic            │
│ created_at   │ TIMESTAMP    │ Auto-generated                │
│ updated_at   │ TIMESTAMP    │ Auto-updated                  │
└──────────────┴──────────────┴───────────────────────────────┘

Example OAuth User:
┌─────────┬──────────┬──────────────────┬──────────┬────────────┬──────────┬────────────────┬────────┬──────────────────┐
│ user_id │ full_name│ email            │ password │ auth_provider│ oauth_id │ email_verified │ role   │ profile_picture  │
├─────────┼──────────┼──────────────────┼──────────┼──────────────┼──────────┼────────────────┼────────┼──────────────────┤
│ 1       │ John Doe │ john@gmail.com   │ NULL     │ GOOGLE       │ 10987654 │ true           │ RENTER │ https://lh3...   │
└─────────┴──────────┴──────────────────┴──────────┴──────────────┴──────────┴────────────────┴────────┴──────────────────┘

Example Local User:
┌─────────┬──────────┬──────────────────┬──────────────────┬──────────────┬──────────┬────────────────┬────────┬──────────────────┐
│ user_id │ full_name│ email            │ password         │ auth_provider│ oauth_id │ email_verified │ role   │ profile_picture  │
├─────────┼──────────┼──────────────────┼──────────────────┼──────────────┼──────────┼────────────────┼────────┼──────────────────┤
│ 2       │ Jane Doe │ jane@email.com   │ $2a$10$AbC...   │ LOCAL        │ NULL     │ false          │ OWNER  │ NULL             │
└─────────┴──────────┴──────────────────┴──────────────────┴──────────────┴──────────┴────────────────┴────────┴──────────────────┘
```

## JWT Token Structure

```
┌────────────────────────────────────────────────────────────┐
│                         JWT Token                          │
│     eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGVtYWlsLmNvbSI  │
│     sImV4cCI6MTY0MDk5NTIwMCwiaWF0IjoxNjQwOTA4ODAwfQ.      │
│     SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c           │
└────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌────────┐          ┌─────────┐        ┌───────────┐
   │ Header │          │ Payload │        │ Signature │
   └────────┘          └─────────┘        └───────────┘
   {"alg":             {"sub":            HMACSHA256(
    "HS256",            "user@email.com",  base64UrlEncode(header) + "." +
    "typ":              "role":            base64UrlEncode(payload),
    "JWT"}              "RENTER",          secret
                        "exp": 1640995200,
                        "iat": 1640908800}
```

## API Endpoints Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Public Endpoints                        │
│                     (No authentication)                       │
├─────────────────────────────────────────────────────────────┤
│ POST   /api/v1/auth/register                                 │
│ POST   /api/v1/auth/login                                    │
│ GET    /api/v1/auth/test                                     │
│ GET    /oauth2/authorization/google                          │
│ GET    /api/v1/auth/oauth2/callback/google                   │
│ GET    /login/oauth2/code/google                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Protected Endpoints                        │
│              (Requires JWT token in header)                  │
├─────────────────────────────────────────────────────────────┤
│ GET    /api/v1/profile                                       │
│ PUT    /api/v1/profile                                       │
│ GET    /api/v1/vehicles                                      │
│ POST   /api/v1/vehicles                  (OWNER role)        │
│ GET    /api/v1/bookings                                      │
│ POST   /api/v1/bookings                  (RENTER role)       │
│ GET    /api/v1/admin/**                  (ADMIN role)        │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Error Scenarios                            │
└──────────────────────────────────────────────────────────────┘

1. Invalid OAuth Credentials
   ┌─────────┐     ┌─────────┐     ┌──────────┐
   │ Backend ├────►│ Google  ├────►│ Error:   │
   │         │     │         │     │ invalid_ │
   │         │◄────┤         │◄────┤ client   │
   └─────────┘     └─────────┘     └──────────┘

2. Redirect URI Mismatch
   ┌─────────┐     ┌─────────┐     ┌──────────────┐
   │ Backend ├────►│ Google  ├────►│ Error 400:   │
   │         │     │         │     │ redirect_uri │
   │         │◄────┤         │◄────┤ _mismatch    │
   └─────────┘     └─────────┘     └──────────────┘

3. Email Not Provided
   ┌─────────┐     ┌──────────────┐     ┌──────────────┐
   │ Google  ├────►│ OAuth2User   ├────►│ RuntimeError:│
   │         │     │ Service      │     │ Email not    │
   │         │     │              │     │ found        │
   └─────────┘     └──────────────┘     └──────────────┘

4. Mixed Auth Provider
   ┌────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Existing   ├────►│ OAuth2User   ├────►│ RuntimeError:│
   │ LOCAL user │     │ Service      │     │ Already      │
   │            │     │              │     │ registered   │
   └────────────┘     └──────────────┘     └──────────────┘
```

## Configuration Files Structure

```
rentMe_backend/
├── .env
│   ├── GOOGLE_CLIENT_ID
│   ├── GOOGLE_CLIENT_SECRET
│   ├── FRONTEND_URL
│   ├── SPRING_DATASOURCE_URL
│   ├── SPRING_DATASOURCE_USERNAME
│   └── SPRING_DATASOURCE_PASSWORD
│
├── src/main/resources/application.properties
│   ├── OAuth2 Google Configuration
│   │   ├── client-id=${GOOGLE_CLIENT_ID}
│   │   ├── client-secret=${GOOGLE_CLIENT_SECRET}
│   │   ├── scope=profile,email
│   │   └── redirect-uri
│   └── OAuth2 Provider Details
│       ├── authorization-uri
│       ├── token-uri
│       ├── user-info-uri
│       └── user-name-attribute
│
└── pom.xml
    └── spring-boot-starter-oauth2-client
```

## Summary

This OAuth2 implementation provides:

✅ Secure Google authentication
✅ Automatic user creation/update
✅ JWT token generation
✅ Seamless frontend integration
✅ Provider validation (no mixing)
✅ Email verification auto-enabled
✅ Extensible for more providers

All components work together to provide a complete, production-ready OAuth2 authentication system.
