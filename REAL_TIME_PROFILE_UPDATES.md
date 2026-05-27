# Real-Time Profile Updates - Implementation Guide

## Overview

This document explains how the real-time profile update system works in the rentMe application.

## Architecture

### Two-Context System

We use a two-context architecture to separate concerns:

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Manages authentication state (userId, email, role, authProvider)
   - Handles login, logout, and registration
   - Stores minimal user info from authentication responses

2. **UserProfileContext** (`contexts/UserProfileContext.tsx`)
   - Manages full user profile data (fullName, contactNumber, dateOfBirth, profilePicture, etc.)
   - Fetches complete profile from `/api/v1/users/me` endpoint
   - Provides real-time updates across all components
   - Auto-fetches profile when user is authenticated

### Benefits of This Approach

- **Separation of Concerns**: Auth and profile data are managed independently
- **Real-Time Updates**: Profile changes immediately reflect everywhere
- **Performance**: Profile data is cached in context, reducing API calls
- **Type Safety**: Full TypeScript support with proper types

## How It Works

### 1. Context Providers Setup

Both providers are set up in `app/layout.tsx`:

```tsx
<AuthProvider>
  <UserProfileProvider>{children}</UserProfileProvider>
</AuthProvider>
```

**Important**: `UserProfileProvider` must be nested inside `AuthProvider` so it can access auth state.

### 2. Authentication Flow

#### Login

1. User logs in via `useAuth().login(credentials)`
2. AuthService stores userId, email, role in localStorage
3. AuthContext updates auth state
4. UserProfileProvider automatically fetches full profile (triggered by userId in localStorage)
5. All components using `useUserProfile()` receive the profile data

#### Logout

1. Component calls `useAuth().logout()`
2. AuthService calls backend `/api/v1/auth/logout` endpoint (clears HTTP-only cookies)
3. AuthService clears localStorage
4. AuthContext clears auth state
5. UserProfileContext clears profile data
6. User is redirected to login page

### 3. Profile Update Flow

When a user updates their profile:

1. User edits profile in `UserProfilePage` component
2. Component calls `userService.updateUser(userId, updates)`
3. Backend updates the user data
4. Component calls `updateProfile(updatedUser)` from `useUserProfile()`
5. **Real-time update**: All components using `useUserProfile()` instantly receive the new data
6. Profile sidebar, navigation, and any other component displaying user info updates automatically

## Usage Examples

### Using Profile Data in Components

```tsx
import { useUserProfile } from "@/contexts";

function MyComponent() {
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Hello, {profile.fullName}!</h1>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.contactNumber}</p>
    </div>
  );
}
```

### Updating Profile

```tsx
import { useUserProfile } from "@/contexts";
import { userService } from "@/services";

function EditProfile() {
  const { updateProfile } = useUserProfile();

  const handleSave = async (newData) => {
    const userId = parseInt(localStorage.getItem("user_id"));
    const updatedUser = await userService.updateUser(userId, newData);

    // Update context for real-time updates everywhere
    updateProfile(updatedUser);
  };

  return <form onSubmit={handleSave}>...</form>;
}
```

### Manual Profile Refresh

If you need to refresh profile data from the server:

```tsx
import { useUserProfile } from "@/contexts";

function MyComponent() {
  const { refreshProfile } = useUserProfile();

  const handleRefresh = async () => {
    await refreshProfile();
  };

  return <button onClick={handleRefresh}>Refresh Profile</button>;
}
```

## Files Modified

### Core Context Files

- ✅ `contexts/AuthContext.tsx` - Authentication management
- ✅ `contexts/UserProfileContext.tsx` - **NEW** - Profile data management
- ✅ `contexts/index.ts` - Export both contexts

### Services

- ✅ `services/auth.service.ts` - Now calls `/api/v1/auth/logout` endpoint
- ✅ `services/user.service.ts` - User profile CRUD operations

### Components

- ✅ `components/auth/user-profile-page.tsx` - Calls `updateProfile()` after save
- ✅ `components/auth/profile-sidebar.tsx` - Reads from `useUserProfile()`, uses `useAuth().logout()`
- ✅ `app/layout.tsx` - Wraps app with both providers

### Types

- ✅ `types/user.ts` - Added `profilePicture` field

## Backend Integration

### Auth Endpoints (Already Integrated)

- ✅ `POST /api/v1/auth/login` - Sets HTTP-only cookie, returns user info
- ✅ `POST /api/v1/auth/register` - Creates user, sets cookie
- ✅ `POST /api/v1/auth/google` - Google OAuth login
- ✅ `POST /api/v1/auth/logout` - **NOW USED** - Clears HTTP-only cookies

### User Endpoints (Integrated via userService)

- ✅ `GET /api/v1/users/me` - Fetch current user's full profile
- ✅ `PUT /api/v1/users/{userId}` - Update user profile
- ✅ `DELETE /api/v1/users/{userId}` - Delete user account

## Testing the Real-Time Updates

1. **Login** to the application
2. Open **Profile Sidebar** - note the user's full name and email
3. Navigate to **Manage Profile**
4. **Edit your name** (e.g., change "John Doe" to "Jane Smith")
5. **Save** the changes
6. **Immediately** see the updated name in:
   - Profile page header
   - Profile sidebar (if you open it again)
   - Navigation bar avatar/name
   - Any other component displaying user info

No page refresh needed! ✨

## Benefits

### For Users

- **Instant feedback** when profile changes are saved
- **Consistent data** across all pages and components
- **No page refreshes** needed

### For Developers

- **Simple API**: Just use `useUserProfile()` hook
- **Automatic updates**: No manual state management needed
- **Type-safe**: Full TypeScript support
- **Centralized logic**: All profile logic in one place

## Future Enhancements

Potential improvements:

- Add optimistic updates (update UI before API call completes)
- Implement profile picture upload to backend
- Add profile caching with expiration
- WebSocket integration for multi-device sync
- Profile change history/audit log

---

**Created**: February 2026  
**Last Updated**: February 2026
