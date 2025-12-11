# OAuth2 Google Authentication - Implementation Guide

## Overview
This document explains how Google OAuth2 authentication is implemented in the rentMe system.

## Architecture

### Authentication Flow
1. **User Initiates Login**: User clicks "Sign in with Google" button on frontend
2. **Redirect to Google**: Frontend redirects to: `http://localhost:8080/oauth2/authorization/google`
3. **Google Authentication**: User authenticates with Google
4. **Callback**: Google redirects back to: `http://localhost:8080/api/v1/auth/oauth2/callback/google`
5. **Process User**: `CustomOAuth2UserService` processes the OAuth2 user data
6. **Success Handler**: `OAuth2LoginSuccessHandler` generates JWT and redirects to frontend
7. **Frontend Receives Token**: Frontend extracts JWT from URL and stores it

## Components

### 1. Application Properties
Location: `src/main/resources/application.properties`

```properties
# OAuth2 Google Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/api/v1/auth/oauth2/callback/google

# OAuth2 Provider Details
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub
```

### 2. Security Configuration
Location: `src/main/java/com/example/springrentMe/security/SecurityConfig.java`

Key changes:
- Added OAuth2 login configuration
- Configured custom `CustomOAuth2UserService`
- Configured custom `OAuth2LoginSuccessHandler`
- Allowed `/oauth2/**` endpoints as public

### 3. OAuth2 User Service
Location: `src/main/java/com/example/springrentMe/security/oauth2/CustomOAuth2UserService.java`

**Responsibilities:**
- Loads user information from OAuth2 provider (Google)
- Creates new users if they don't exist
- Updates existing users with latest info
- Validates that users don't mix authentication providers

### 4. OAuth2 Success Handler
Location: `src/main/java/com/example/springrentMe/security/oauth2/OAuth2LoginSuccessHandler.java`

**Responsibilities:**
- Generates JWT token after successful OAuth2 authentication
- Redirects user to frontend with token in URL
- Includes user details (userId, email, role) in redirect

### 5. OAuth2 User Info Abstraction
Location: `src/main/java/com/example/springrentMe/security/oauth2/`

**Files:**
- `OAuth2UserInfo.java` - Abstract base class
- `GoogleOAuth2UserInfo.java` - Google-specific implementation
- `OAuth2UserInfoFactory.java` - Factory to create appropriate implementation

**Purpose:** Standardizes user data extraction across different OAuth2 providers (Google, Facebook, etc.)

### 6. User Details Implementation
Location: `src/main/java/com/example/springrentMe/security/UserDetailsImpl.java`

**Changes:**
- Now implements both `UserDetails` and `OAuth2User` interfaces
- Added `attributes` field for OAuth2 attributes
- Added `create()` method to support OAuth2 authentication

## User Model

The `User` entity supports both LOCAL and OAuth authentication:

```java
@Enumerated(EnumType.STRING)
@Column(name = "auth_provider", nullable = false)
private AuthProvider authProvider; // LOCAL, GOOGLE, FACEBOOK

@Column(name = "oauth_id", unique = true)
private String oauthId; // Provider's unique user ID

@Column(length = 255)
private String password; // NULL for OAuth users

@Column(name = "email_verified", nullable = false)
private Boolean emailVerified = false; // Auto-true for OAuth
```

## Frontend Integration

### Initiate Google Login
Direct users to this URL:
```
http://localhost:8080/oauth2/authorization/google
```

### Handle OAuth2 Redirect
Create a component at `/oauth2/redirect` to handle the callback:

```typescript
// Example Next.js page: app/oauth2/redirect/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuth2RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (token) {
      // Store token in localStorage or cookie
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_role', role);

      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // Handle error
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return <div>Processing login...</div>;
}
```

### Google Sign-In Button
```typescript
export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}
```

## Testing

### 1. Test OAuth2 Flow

1. Start the backend:
```bash
cd rentMe_backend
./mvnw spring-boot:run
```

2. Open browser and navigate to:
```
http://localhost:8080/oauth2/authorization/google
```

3. Sign in with Google account

4. You should be redirected to:
```
http://localhost:3000/oauth2/redirect?token=xxx&userId=1&email=user@example.com&role=RENTER
```

### 2. Verify User Creation

Check the database to confirm user was created with:
- `auth_provider = 'GOOGLE'`
- `oauth_id` = Google user ID
- `email_verified = true`
- `password = NULL`

### 3. Test Token

Use the JWT token to make authenticated requests:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/v1/some-protected-endpoint
```

## Configuration Checklist

### Backend (.env file)
- [x] `GOOGLE_CLIENT_ID` set
- [x] `GOOGLE_CLIENT_SECRET` set
- [x] `SPRING_DATASOURCE_URL` configured
- [x] `JWT_SECRET` configured

### Google Cloud Console
- [x] OAuth2 credentials created
- [x] Authorized redirect URIs configured:
  - `http://localhost:8080/api/v1/auth/oauth2/callback/google`
  - `http://localhost:8080/login/oauth2/code/google` (Spring's default)
- [x] OAuth consent screen configured

### Database
- [x] `users` table has `auth_provider` column
- [x] `users` table has `oauth_id` column
- [x] `password` column is nullable

## Security Considerations

1. **Token Security**: JWT tokens are signed using HS256 algorithm
2. **HTTPS Required**: In production, use HTTPS for all OAuth2 endpoints
3. **State Parameter**: Spring Security automatically includes CSRF protection
4. **Email Verification**: OAuth users are automatically marked as email verified
5. **Provider Mixing**: Users cannot mix authentication providers (enforced in `CustomOAuth2UserService`)

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Ensure the redirect URI in Google Cloud Console matches exactly:
```
http://localhost:8080/api/v1/auth/oauth2/callback/google
```

### Error: "Email not found from OAuth2 provider"
**Solution**: Ensure Google OAuth scope includes `email` in application.properties

### Error: "User not found after OAuth2 login"
**Solution**: Check that `CustomOAuth2UserService` is saving users correctly

### Frontend not receiving token
**Solution**: Check `OAuth2LoginSuccessHandler` redirect URL matches your frontend route

## Future Enhancements

1. **Add Facebook OAuth**: Create `FacebookOAuth2UserInfo` class
2. **Add GitHub OAuth**: Create `GitHubOAuth2UserInfo` class  
3. **Refresh Tokens**: Implement refresh token mechanism
4. **Token Revocation**: Add endpoint to revoke tokens
5. **Account Linking**: Allow users to link multiple OAuth providers

## API Endpoints

### OAuth2 Endpoints (Auto-configured by Spring)
- `GET /oauth2/authorization/google` - Initiates Google OAuth flow
- `GET /api/v1/auth/oauth2/callback/google` - Handles callback from Google
- `GET /login/oauth2/code/google` - Alternative callback endpoint

### Custom Endpoints
- `POST /api/v1/auth/register` - Local registration
- `POST /api/v1/auth/login` - Local login
- `GET /api/v1/auth/test` - Test authentication

## Environment Variables Required

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/rentme_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-at-least-256-bits

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## References

- [Spring Security OAuth2 Client Documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
