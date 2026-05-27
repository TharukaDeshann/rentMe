# RentMe Authentication System Design

## Overview

The system supports **dual authentication**: traditional email/password (LOCAL) and OAuth providers (GOOGLE, FACEBOOK, etc.).

## Database Schema

### Core Tables Generated:

```sql
-- Main users table (handles both LOCAL and OAuth users)
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),              -- NULL for OAuth users
    contact_number VARCHAR(20),
    role VARCHAR(20) NOT NULL,          -- RENTER, VEHICLE_OWNER, ADMIN
    profile_picture VARCHAR(500),
    location_id BIGINT,
    date_of_birth DATE,

    -- OAuth fields
    auth_provider VARCHAR(20) NOT NULL, -- LOCAL, GOOGLE, FACEBOOK
    oauth_id VARCHAR(255) UNIQUE,       -- Google/Facebook user ID
    email_verified BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,
    rating DOUBLE PRECISION DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

-- Locations table
CREATE TABLE locations (
    location_id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    place_id VARCHAR(255)
);

-- Renters table (optional additional data)
CREATE TABLE renters (
    renter_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    driver_license_image VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Vehicle Owners table (KYC verification)
CREATE TABLE vehicle_owners (
    owner_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents VARCHAR(1000),
    verification_status VARCHAR(20) DEFAULT 'NOT_SUBMITTED',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Admins table
CREATE TABLE admins (
    admin_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    can_verify_owners BOOLEAN DEFAULT TRUE,
    can_manage_users BOOLEAN DEFAULT TRUE,
    can_moderate_content BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## Authentication Flow

### Scenario 1: Traditional Registration (LOCAL)

```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "RENTER"
}
```

**Database Storage:**

```java
User {
  fullName: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...",        // BCrypt hashed
  role: RENTER,
  authProvider: LOCAL,
  oauthId: null,
  emailVerified: false
}
```

### Scenario 2: Google OAuth Registration

```json
POST /api/auth/oauth/google
{
  "googleToken": "eyJhbGciOiJSUzI1NiIs...",
  "role": "VEHICLE_OWNER"
}
```

**Backend extracts from Google:**

- Email: john.doe@gmail.com
- Full Name: John Doe
- Profile Picture: https://lh3.googleusercontent.com/...
- OAuth ID: 108234567890123456789

**Database Storage:**

```java
User {
  fullName: "John Doe",              // From Google
  email: "john.doe@gmail.com",       // From Google
  password: null,                    // No password needed!
  profilePicture: "https://...",     // From Google
  role: VEHICLE_OWNER,               // User selected
  authProvider: GOOGLE,
  oauthId: "108234567890123456789",  // From Google
  emailVerified: true                // Auto-verified by Google
}
```

## Key Benefits of This Design

### 1. Single User Table ✅

- No separate tables for OAuth vs LOCAL users
- Unified user management
- Easy to query and join

### 2. Nullable Password Field ✅

- `password` is NULL for OAuth users
- `password` is BCrypt hash for LOCAL users
- Database enforces this at application layer

### 3. Provider Tracking ✅

```java
// Check authentication method
if (user.isOAuthUser()) {
    // Cannot change password
    // Already email verified
}

if (user.getAuthProvider() == AuthProvider.GOOGLE) {
    // Can re-authenticate with Google token
}
```

### 4. Email Verification ✅

- LOCAL users: Send verification email
- OAuth users: Auto-verified (emailVerified = true)

## Authentication Methods

### LOCAL Login

```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Backend validates:**

1. Check `authProvider == LOCAL`
2. Verify BCrypt password
3. Return JWT token

### Google OAuth Login

```http
POST /api/auth/oauth/google
{
  "googleToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Backend validates:**

1. Verify Google token with Google API
2. Extract email from token
3. Find user by email OR create new user
4. Return JWT token

## User Registration Flow

### Step 1: User chooses authentication method

**Option A: Local Registration**

- Provide: email, password, name
- System stores: All fields + hashed password
- `authProvider = LOCAL`

**Option B: Google Sign-Up**

- Click "Sign in with Google"
- Google provides: email, name, picture, oauth_id
- User chooses: role (RENTER/OWNER)
- System stores: Google data + selected role
- `authProvider = GOOGLE`
- `password = NULL`

### Step 2: Role-specific setup

**If RENTER:**

- Create `Renter` record linked to `User`
- Optionally upload driver's license

**If VEHICLE_OWNER:**

- Create `VehicleOwner` record linked to `User`
- Must upload verification documents (NIC)
- `verificationStatus = PENDING`
- Cannot list vehicles until Admin approves

**If ADMIN:**

- Manually created by super admin
- Create `Admin` record with permissions

## Profile Completion

### OAuth Users (Google)

Already have:

- ✅ Full name
- ✅ Email (verified)
- ✅ Profile picture

Need to provide:

- Contact number
- Location
- Date of birth

### LOCAL Users

Already have:

- ✅ Full name
- ✅ Email
- ✅ Password

Need to provide:

- Email verification (click link)
- Contact number
- Location
- Date of birth
- Profile picture

## Example Use Cases

### Use Case 1: Owner KYC Verification

```java
// Owner registers with Google
User owner = userService.registerWithGoogle(googleToken, UserRole.VEHICLE_OWNER);
// password = null, emailVerified = true, authProvider = GOOGLE

// System creates VehicleOwner record
VehicleOwner vehicleOwner = new VehicleOwner();
vehicleOwner.setUser(owner);
vehicleOwner.setIsVerified(false);
vehicleOwner.setVerificationStatus(VerificationStatus.NOT_SUBMITTED);

// Owner uploads NIC documents
vehicleOwner.setVerificationDocuments("https://storage/nic_front.jpg,https://storage/nic_back.jpg");
vehicleOwner.setVerificationStatus(VerificationStatus.PENDING);

// Admin approves
vehicleOwner.setIsVerified(true);
vehicleOwner.setVerificationStatus(VerificationStatus.APPROVED);

// Now owner can list vehicles!
```

### Use Case 2: Password Reset (LOCAL users only)

```java
// Check if user can reset password
if (user.getAuthProvider() != AuthProvider.LOCAL) {
    throw new BadRequestException("OAuth users cannot reset password. Use your provider to login.");
}

// Proceed with password reset
String resetToken = generatePasswordResetToken(user);
emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
```

### Use Case 3: Account Linking (Future)

```java
// User registered with email/password, wants to link Google
User user = findByEmail("john@example.com");
if (user.getAuthProvider() == AuthProvider.LOCAL) {
    // Allow linking Google account
    user.setOauthId(googleOAuthId);
    // Keep authProvider as LOCAL (primary method)
}
```

## Security Considerations

1. **Password Validation**: Only check password if `authProvider == LOCAL`
2. **Email Uniqueness**: Email must be unique across all providers
3. **OAuth Token Expiry**: Verify Google tokens on each OAuth login
4. **KYC for Owners**: Cannot list vehicles until `isVerified == true`
5. **JWT Tokens**: Include `userId`, `role`, `authProvider` in JWT payload

## Summary

✅ **One unified `users` table** handles both LOCAL and OAuth users
✅ **Nullable `password`** field (NULL for OAuth, BCrypt for LOCAL)
✅ **`authProvider`** enum tracks registration method
✅ **`oauthId`** stores Google/Facebook user ID
✅ **Role-specific tables** (`Renter`, `VehicleOwner`, `Admin`) for additional data
✅ **Email verification** automatic for OAuth, manual for LOCAL
✅ **Flexible design** supports multiple OAuth providers in future

This design follows industry best practices used by platforms like Airbnb, Uber, and Turo.
