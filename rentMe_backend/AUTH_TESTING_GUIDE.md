# Authentication API Testing Guide

## Overview

Authentication system is now fully implemented with JWT-based authentication and the Adapter Design Pattern for Spring Security integration.

## Architecture

```
User Request → AuthController → AuthService → CustomUserDetailsService
                                    ↓
                              UserDetailsImpl (Adapter)
                                    ↓
                              UserRepository → Database
```

## Available Endpoints

### 1. Register New User

```http
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contactNumber": "+94771234567",
  "role": "RENTER"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "john@example.com",
  "role": "RENTER"
}
```

### 2. Login

```http
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "john@example.com",
  "role": "RENTER"
}
```

### 3. Test Protected Endpoint

```http
GET http://localhost:8080/api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing with Postman

### Step 1: Start the Application

```bash
cd rentMe_backend
./mvnw spring-boot:run
```

### Step 2: Register a User

1. Open Postman
2. Create new POST request to `http://localhost:8080/api/v1/auth/register`
3. Set Body → raw → JSON
4. Paste registration JSON
5. Click Send
6. Save the `token` from response

### Step 3: Test Login

1. Create new POST request to `http://localhost:8080/api/v1/auth/login`
2. Set Body → raw → JSON
3. Paste login credentials
4. Click Send
5. Verify you receive a token

### Step 4: Access Protected Endpoint

1. Create new GET request to any protected endpoint
2. Go to Authorization tab
3. Select Type: Bearer Token
4. Paste your JWT token
5. Click Send

## User Roles

- **RENTER**: Can browse and book vehicles
- **OWNER**: Can list vehicles (after KYC verification)
- **ADMIN**: Full platform access

## Security Features Implemented

✅ JWT token-based authentication
✅ BCrypt password hashing
✅ Adapter pattern for Spring Security integration
✅ Role-based access control
✅ Stateless authentication (no sessions)
✅ OAuth2 ready (Google login placeholder)

## Database Schema

The system supports both LOCAL and OAuth authentication:

- LOCAL users: Have password field (BCrypt hashed)
- OAuth users: Password is NULL, authenticated via Google/Facebook

## Next Steps

1. Run the application
2. Test registration endpoint
3. Test login endpoint
4. Use JWT token to access protected endpoints
5. Implement User CRUD operations
6. Add Google OAuth integration (optional)

## Common Issues

### Issue: "Email already registered"

**Solution**: Use a different email or check database

### Issue: "Invalid email or password"

**Solution**: Verify credentials, check if user exists

### Issue: 401 Unauthorized

**Solution**:

- Ensure token is valid
- Check Authorization header format: `Bearer <token>`
- Token expires after 24 hours (default)

## JWT Configuration

Located in `application.properties`:

```properties
jwt.secret=mySecretKeyForJWTTokenGeneration...
jwt.expiration=86400000  # 24 hours in milliseconds
```
