# Google OAuth Configuration Guide

## Overview

This guide explains how to set up Google OAuth for the rentMe application.

## Required Environment Variables

Add these to your `.env` file (or environment variables):

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## How to Get Google OAuth Credentials

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)

   - Click on project dropdown → "New Project"
   - Enter project name: "rentMe"
   - Click "Create"

3. **Enable Google+ API**

   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in app name: "rentMe"
     - Add your email
     - Add authorized domains if needed
   - Application type: "Web application"
   - Name: "rentMe OAuth Client"

5. **Configure Authorized Origins and Redirect URIs**

   - **Authorized JavaScript origins:**

     - `http://localhost:3000` (frontend)
     - `http://localhost:8080` (backend)

   - **Authorized redirect URIs:**
     - `http://localhost:8080/login/oauth2/code/google`
     - `http://localhost:3000/oauth2/redirect`

6. **Copy Credentials**
   - Copy the "Client ID" and "Client Secret"
   - Add them to your `.env` file

## Testing the Implementation

### Backend Test (Manual)

```bash
# 1. Get a Google ID token from frontend
# 2. Send POST request to backend
curl -X POST http://localhost:8080/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "your-google-id-token-here"}'
```

### Frontend Implementation

The frontend needs to integrate Google Sign-In. Here's what the frontend should do:

```typescript
// 1. Initialize Google Sign-In
// 2. Get ID token when user clicks "Sign in with Google"
// 3. Send token to backend

const response = await fetch("http://localhost:8080/api/v1/auth/google", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important for cookies
  body: JSON.stringify({ token: googleIdToken }),
});
```

## Security Notes

- **NEVER** commit your `.env` file to Git
- Use different credentials for development and production
- Regularly rotate your client secrets
- Validate tokens on the backend (already implemented)
- Always use HTTPS in production

## Troubleshooting

### "Invalid Google token" error

- Verify GOOGLE_CLIENT_ID matches the client ID in frontend
- Check token hasn't expired (tokens expire after 1 hour)
- Ensure clock sync on server

### "redirect_uri_mismatch" error

- Add the redirect URI to Google Console authorized URIs
- Check for typos in the URI
- Ensure protocol (http/https) matches

### User created but login fails

- Check JWT secret is configured
- Verify user has active status
- Check database connection
