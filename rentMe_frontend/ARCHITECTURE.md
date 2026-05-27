# Frontend Architecture Guide

## 📁 Project Structure

```
rentMe_frontend/
├── app/                      # Next.js App Router pages
├── components/               # Reusable UI components
├── contexts/                 # React Context providers
│   └── AuthContext.tsx      # Global authentication state
├── lib/                      # Core utilities and configurations
│   ├── api/                 # API client configuration
│   │   └── axios.ts         # Centralized axios instance
│   ├── services/            # Service layer for API calls
│   │   ├── auth.service.ts  # Authentication API calls
│   │   └── user.service.ts  # User management API calls
│   ├── validations/         # Zod validation schemas
│   │   └── auth.schemas.ts  # Auth form validations
│   └── utils.ts            # Utility functions
├── types/                   # TypeScript type definitions
│   ├── user.ts             # User-related types
│   ├── auth.ts             # Auth-related types
│   └── index.ts            # Centralized exports
└── hooks/                   # Custom React hooks

```

## 🎯 Architecture Patterns

### 1. **Type Safety (types/)**

Centralized TypeScript types ensure consistency across the application.

```typescript
// ✅ Good: Using centralized types
import { User, UserRole, LoginRequest } from '@/types';

const user: User = {
  userId: 1,
  fullName: "John Doe",
  email: "john@example.com",
  role: UserRole.RENTER,
  // ...
};

// ❌ Bad: Defining types inline
const user: { userId: number; email: string } = { ... };
```

**Available Types:**

- `User`, `UserProfile`, `UpdateUserRequest` - User-related types
- `LoginRequest`, `RegisterRequest`, `AuthResponse` - Auth types
- `UserRole`, `AuthProvider` - Enums

### 2. **API Client (lib/api/axios.ts)**

Centralized axios instance with interceptors for:

- Base URL configuration
- Request/response logging (dev mode)
- Error handling (401, 403, 500, etc.)
- Automatic token management via HTTP-only cookies

```typescript
// ✅ Good: Using axios instance from service layer
import { authService } from "@/lib/services";

const response = await authService.login({ email, password });

// ❌ Bad: Direct fetch calls
const response = await fetch("http://localhost:8080/api/v1/auth/login", {
  method: "POST",
  // ... manual configuration
});
```

**Features:**

- Automatic cookie handling
- Global error interceptors
- Development logging
- Helper function for error messages

### 3. **Service Layer (lib/services/)**

Encapsulates all API calls with clean, typed interfaces.

```typescript
// auth.service.ts
export const login = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials,
  );
  // Handle localStorage, etc.
  return response.data;
};

export const register = async (
  userData: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    userData,
  );
  return response.data;
};
```

**Available Services:**

- `authService` - login, register, googleLogin, logout, isAuthenticated, getCurrentUser
- `userService` - getCurrentUserProfile, getUserById, updateUser, deleteUser

**Usage:**

```typescript
import { authService, userService } from "@/lib/services";

// Login
await authService.login({ email, password });

// Get current user profile
const profile = await userService.getCurrentUserProfile();

// Update profile
await userService.updateUser(userId, { fullName: "New Name" });
```

### 4. **Validation Schemas (lib/validations/)**

Reusable Zod schemas that match backend validation rules.

```typescript
import { registrationSchema, RegistrationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<RegistrationFormData>({
  resolver: zodResolver(registrationSchema),
  mode: "onChange",
});
```

**Available Schemas:**

- `loginSchema` - Email and password validation
- `registrationSchema` - Full registration form validation (matches backend)
- `updateProfileSchema` - Profile update validation

**Benefits:**

- DRY principle - define once, use everywhere
- Type safety - auto-generated TypeScript types
- Backend parity - matches Java validation annotations

### 5. **Auth Context (contexts/AuthContext.tsx)**

Global authentication state management - no more prop drilling!

```typescript
'use client';

import { useAuth } from '@/contexts';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      // Automatic redirect based on role
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

**Context API:**

- `user` - Current authenticated user
- `isAuthenticated` - Boolean auth status
- `isLoading` - Loading state
- `login(credentials)` - Login with email/password
- `register(userData)` - Register new user
- `googleLogin(token)` - OAuth login
- `logout()` - Clear auth state
- `refreshUser()` - Refresh user data from localStorage

**Setup:**
The AuthProvider is already wrapped in `app/layout.tsx`, so all components have access to auth context.

## 📖 Usage Examples

### Example 1: Creating a Protected Page

```typescript
'use client';

import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Example 2: Form with Validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useAuth } from '@/contexts';

export default function LoginForm() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 3: API Service Call

```typescript
'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/services';
import { User } from '@/types';

export default function UserProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getCurrentUserProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile?.fullName}</h1>
      <p>{profile?.email}</p>
    </div>
  );
}
```

## 🔒 Benefits

### Before Refactoring

```typescript
// ❌ Scattered fetch calls
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});

// ❌ Manual localStorage management
localStorage.setItem('user_id', data.userId);
localStorage.setItem('user_email', data.email);

// ❌ Inline validation
if (password.length < 8) setError('Too short');

// ❌ Prop drilling
<Component user={user} setUser={setUser} />
```

### After Refactoring

```typescript
// ✅ Centralized API calls
await authService.login({ email, password });

// ✅ Automatic state management
const { user, login } = useAuth();

// ✅ Reusable validation
const { register } = useForm({ resolver: zodResolver(loginSchema) });

// ✅ No prop drilling
const { user } = useAuth(); // Available anywhere
```

## 🚀 Best Practices

1. **Always use services** for API calls, never direct fetch
2. **Always use centralized types** from `/types`
3. **Always use validation schemas** from `/lib/validations`
4. **Always use AuthContext** for auth state, never localStorage directly
5. **Keep components clean** - business logic in services, UI in components

## 🛠️ Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 📝 Adding New Features

### Adding a New API Endpoint

1. **Define types** in `types/`

```typescript
// types/vehicle.ts
export interface Vehicle {
  id: number;
  model: string;
  // ...
}
```

2. **Create service** in `lib/services/`

```typescript
// lib/services/vehicle.service.ts
import apiClient from "../api/axios";
import { Vehicle } from "@/types";

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await apiClient.get<Vehicle[]>("/vehicles");
  return response.data;
};
```

3. **Use in component**

```typescript
import { getVehicles } from "@/lib/services/vehicle.service";

const vehicles = await getVehicles();
```

### Adding Form Validation

1. **Create schema** in `lib/validations/`

```typescript
// lib/validations/vehicle.schemas.ts
export const vehicleSchema = z.object({
  model: z.string().min(1, "Model is required"),
  // ...
});
```

2. **Use in form**

```typescript
const { register } = useForm({
  resolver: zodResolver(vehicleSchema),
});
```

## 🎓 Summary

This architecture provides:

- ✅ **Type Safety** - TypeScript types everywhere
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Reusability** - DRY principle applied
- ✅ **Scalability** - Easy to add new features
- ✅ **Consistency** - Same patterns throughout
- ✅ **Developer Experience** - Auto-completion, type checking

Happy coding! 🚀
