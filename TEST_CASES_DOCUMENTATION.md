# CI/CD Test Cases Documentation

This document describes the comprehensive test suite for the RentMe vehicle rental platform authentication system.

## Backend Test Suite

### 1. AuthServiceTest

**Location:** `rentMe_backend/src/test/java/com/example/springrentMe/services/AuthServiceTest.java`

**Test Cases:**

- ✅ `testRegister_Success` - Validates successful user registration with all required fields
- ✅ `testRegister_EmailAlreadyExists` - Ensures duplicate email prevention
- ✅ `testLogin_Success` - Validates successful login with valid credentials
- ✅ `testLogin_InvalidCredentials` - Ensures invalid credentials are rejected
- ✅ `testRegister_PasswordEncoding` - Verifies BCrypt password encoding
- ✅ `testRegister_AuthProvider` - Confirms LOCAL auth provider is set correctly
- ✅ `testRegister_CreateRenter` - Validates Renter entity creation on registration
- ✅ `testRegister_ReturnsUserId` - Ensures user ID is returned in response

**Coverage:** AuthService business logic, user registration, authentication, password encoding

---

### 2. AuthControllerTest

**Location:** `rentMe_backend/src/test/java/com/example/springrentMe/controllers/AuthControllerTest.java`

**Test Cases:**

- ✅ `testRegister_Success` - POST /api/v1/auth/register returns 200 with JWT cookie
- ✅ `testRegister_DuplicateEmail` - POST /api/v1/auth/register returns 400 for duplicate
- ✅ `testLogin_Success` - POST /api/v1/auth/login returns 200 with JWT cookie
- ✅ `testLogin_InvalidCredentials` - POST /api/v1/auth/login returns 401 for invalid credentials
- ✅ `testGoogleLogin_Success` - POST /api/v1/auth/google returns 200 with JWT cookie
- ✅ `testGoogleLogin_InvalidToken` - POST /api/v1/auth/google returns 401 for invalid token
- ✅ `testLogout_Success` - POST /api/v1/auth/logout clears cookies
- ✅ `testAuthEndpoint` - GET /api/v1/auth/test returns success message
- ✅ `testRegister_MissingFields` - Validates required field validation
- ✅ `testLogin_TokenInCookieOnly` - Ensures JWT is only in HTTP-only cookie, not response body

**Coverage:** REST API endpoints, HTTP status codes, JWT cookie handling, request/response validation

---

### 3. SecurityConfigTest

**Location:** `rentMe_backend/src/test/java/com/example/springrentMe/security/SecurityConfigTest.java`

**Test Cases:**

- ✅ `testPublicEndpoints_NoAuth` - Public auth endpoints accessible without JWT
- ✅ `testProtectedEndpoints_NoAuth` - Protected endpoints return 401 without JWT
- ✅ `testCORS_AllowedOrigin` - CORS allows requests from localhost:3000
- ✅ `testCSRF_Disabled` - CSRF protection disabled for REST API
- ✅ `testRoleBasedAccess` - Role-based access control enforced
- ✅ `testCORS_Preflight` - OPTIONS requests handled for CORS preflight

**Coverage:** Security configuration, CORS, CSRF, authentication filters, role-based authorization

---

### 4. JwtTokenProviderTest

**Location:** `rentMe_backend/src/test/java/com/example/springrentMe/utils/JwtTokenProviderTest.java`

**Test Cases:**

- ✅ `testGenerateTokenFromUsername` - JWT generation from username
- ✅ `testGenerateToken` - JWT generation from Authentication object
- ✅ `testGetUsernameFromToken` - Username extraction from valid token
- ✅ `testValidateToken_ValidToken` - Valid token accepted
- ✅ `testValidateToken_InvalidToken` - Invalid token rejected
- ✅ `testValidateToken_NullToken` - Null token rejected
- ✅ `testValidateToken_EmptyToken` - Empty token rejected
- ✅ `testGenerateToken_DifferentUsers` - Different tokens for different users
- ✅ `testGenerateToken_SameUser` - Consistent token generation for same user

**Coverage:** JWT generation, validation, username extraction, token security

---

### 5. AuthenticationIntegrationTest

**Location:** `rentMe_backend/src/test/java/com/example/springrentMe/integration/AuthenticationIntegrationTest.java`

**Test Cases:**

- ✅ `testFullAuthenticationFlow` - Complete registration → logout → login flow
- ✅ `testDuplicateRegistration` - Prevents duplicate user registration
- ✅ `testLoginWithWrongPassword` - Rejects incorrect password
- ✅ `testLoginNonExistentUser` - Rejects login for non-existent user
- ✅ `testUserDataPersistence` - Verifies database persistence
- ✅ `testCookieSecurityAttributes` - Validates HTTP-only, secure cookie attributes

**Coverage:** End-to-end authentication flows, database integration, cookie security

---

## Frontend Test Suite

### 6. GoogleSignInButton.test.tsx

**Location:** `rentMe_frontend/__tests__/GoogleSignInButton.test.tsx`

**Test Cases:**

- ✅ `renders loading state initially` - Shows loading UI while SDK loads
- ✅ `loads Google SDK script` - Dynamically loads Google Identity Services script
- ✅ `initializes Google Sign-In with correct config` - Validates SDK initialization
- ✅ `renders Google button after SDK loads` - Renders official Google button
- ✅ `handles successful Google authentication` - Sends token to backend, receives JWT
- ✅ `stores user data in localStorage after successful login` - Persists user data
- ✅ `displays error when Google authentication fails` - Error handling
- ✅ `shows processing state during authentication` - Loading state management
- ✅ `cleans up script on unmount` - Component cleanup

**Coverage:** Google OAuth client-side flow, SDK integration, state management, error handling

---

### 7. login.test.tsx

**Location:** `rentMe_frontend/__tests__/login.test.tsx`

**Test Cases:**

- ✅ `renders login form` - Displays email and password inputs
- ✅ `renders Google Sign-In button` - Shows Google OAuth option
- ✅ `handles form input changes` - Form state management
- ✅ `submits form with valid credentials` - POST to /api/v1/auth/login
- ✅ `displays error message on failed login` - Error UI handling
- ✅ `stores user data in localStorage on successful login` - Data persistence
- ✅ `redirects to dashboard on successful login` - Navigation after auth
- ✅ `disables submit button during login process` - Prevents double submission
- ✅ `validates email format` - HTML5 validation
- ✅ `requires both email and password` - Required field validation

**Coverage:** Login form, local authentication, form validation, navigation, error handling

---

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

**Location:** `.github/workflows/ci-cd.yml`

**Pipeline Stages:**

1. **Backend Tests**

   - Sets up PostgreSQL service container
   - Runs JUnit tests with Maven
   - Generates test reports
   - Uploads coverage to Codecov

2. **Frontend Tests**

   - Sets up Node.js environment
   - Runs Jest tests with coverage
   - Uploads coverage to Codecov

3. **Integration Tests**

   - Runs after unit tests pass
   - Full database integration
   - End-to-end authentication flow validation

4. **Build & Package**

   - Builds backend JAR
   - Builds frontend production bundle
   - Uploads artifacts

5. **Security Scan**

   - Trivy vulnerability scanner
   - Uploads results to GitHub Security

6. **Docker Build**
   - Builds Docker images (main branch only)
   - Pushes to Docker Hub with tags

---

## Running Tests Locally

### Backend Tests

```bash
cd rentMe_backend
mvn clean test
```

### Frontend Tests

```bash
cd rentMe_frontend
npm install
npm test
```

### With Coverage

```bash
# Backend
mvn clean test jacoco:report

# Frontend
npm test -- --coverage
```

### Integration Tests Only

```bash
cd rentMe_backend
mvn verify -Dtest=*IntegrationTest
```

---

## Test Coverage Goals

- **Backend:** 70%+ line coverage
- **Frontend:** 70%+ line coverage
- **Critical Paths:** 90%+ coverage (authentication, security)

---

## Required GitHub Secrets

For CI/CD pipeline to work, configure these secrets in GitHub repository settings:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `API_URL` - Backend API URL (e.g., http://localhost:8080)

---

## Test Execution Matrix

| Test Suite                    | Technology        | Execution Time | Coverage        |
| ----------------------------- | ----------------- | -------------- | --------------- |
| AuthServiceTest               | JUnit 5 + Mockito | ~2s            | Service layer   |
| AuthControllerTest            | Spring MockMvc    | ~3s            | REST endpoints  |
| SecurityConfigTest            | Spring MockMvc    | ~2s            | Security config |
| JwtTokenProviderTest          | JUnit 5           | ~1s            | JWT utilities   |
| AuthenticationIntegrationTest | Spring Boot Test  | ~5s            | Full stack      |
| GoogleSignInButton.test       | Jest + RTL        | ~1s            | Google OAuth UI |
| login.test                    | Jest + RTL        | ~1s            | Login form UI   |

**Total Execution Time:** ~15 seconds

---

## Best Practices Implemented

✅ Unit tests isolated with mocks  
✅ Integration tests with real database  
✅ Frontend tests with mocked fetch and localStorage  
✅ Proper test naming conventions (`test<Feature>_<Scenario>`)  
✅ Given-When-Then structure in tests  
✅ Comprehensive assertions  
✅ Error case coverage  
✅ Edge case testing  
✅ Test data builders with BeforeEach  
✅ Cleanup in afterEach hooks

---

## Continuous Improvement

- Add E2E tests with Playwright/Cypress
- Implement mutation testing
- Add performance benchmarks
- Monitor test flakiness
- Maintain test documentation
