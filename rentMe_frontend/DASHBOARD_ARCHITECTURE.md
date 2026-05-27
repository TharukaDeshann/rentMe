# Role-Based Dashboard Architecture

## 🎯 Overview

The application now uses **separate route-based dashboards** for each user role with role-specific layouts and navigation.

## 📁 New Structure

```
app/
├── admin/                          # 🔴 Admin Area
│   ├── layout.tsx                  # Admin layout with navigation
│   ├── page.tsx                    # Admin Dashboard (Analytics)
│   ├── users/
│   │   └── page.tsx               # User Management
│   ├── verifications/
│   │   └── page.tsx               # Verification Queue
│   └── analytics/
│       └── page.tsx               # Analytics & Metrics
│
├── owner/                          # 🟢 Vehicle Owner Area
│   ├── layout.tsx                  # Owner layout with navigation
│   ├── page.tsx                    # Owner Dashboard
│   ├── vehicles/
│   │   └── page.tsx               # My Vehicles
│   ├── bookings/
│   │   └── page.tsx               # Booking Requests
│   └── verification/
│       └── page.tsx               # Submit Verification
│
└── renter/                         # 🟣 Renter Area
    ├── layout.tsx                  # Renter layout with navigation
    ├── page.tsx                    # Browse Vehicles (Home)
    └── bookings/
        └── page.tsx               # My Bookings
```

## 🚀 Login Redirects

After successful login, users are automatically redirected:

| Role              | Redirect To | What They See                                          |
| ----------------- | ----------- | ------------------------------------------------------ |
| **ADMIN**         | `/admin`    | Analytics, User Management, Verification Queue         |
| **VEHICLE_OWNER** | `/owner`    | Dashboard, My Vehicles, Booking Requests, Verification |
| **RENTER**        | `/renter`   | Browse Vehicles, My Bookings, Profile                  |

## 🔒 Route Protection

Each layout automatically protects its routes:

### Admin Layout (`/admin/*`)

- ✅ Only accessible to users with `ADMIN` role
- ❌ Non-admin users → redirected to appropriate dashboard
- ❌ Unauthenticated users → redirected to `/login`

### Owner Layout (`/owner/*`)

- ✅ Only accessible to users with `VEHICLE_OWNER` role
- ❌ Non-owner users → redirected to appropriate dashboard
- ❌ Unauthenticated users → redirected to `/login`

### Renter Layout (`/renter/*`)

- ✅ Only accessible to users with `RENTER` role
- ❌ Non-renter users → redirected to appropriate dashboard
- ❌ Unauthenticated users → redirected to `/login`

## 🎨 Layout Features

Each role has a **dedicated layout** with:

### 1. **Role-Specific Branding**

```
Admin  → Blue theme  (rentMe Admin)
Owner  → Green theme (rentMe Owner)
Renter → Purple theme (rentMe)
```

### 2. **Navigation Links**

Only shows links relevant to that role:

**Admin Navigation:**

- Dashboard
- User Management
- Verifications
- Analytics

**Owner Navigation:**

- Dashboard
- My Vehicles
- Booking Requests
- Verification

**Renter Navigation:**

- Browse Vehicles
- My Bookings
- Profile

### 3. **User Info Badge**

Shows current user email and role badge in header

### 4. **Logout**

Logout button in every layout

## 📋 Available Pages

### Admin Pages

- `/admin` - Dashboard with analytics overview
- `/admin/users` - User management and monitoring
- `/admin/verifications` - Review vehicle owner verification requests
- `/admin/analytics` - Platform metrics and insights

### Owner Pages

- `/owner` - Dashboard with overview (vehicles, bookings, earnings)
- `/owner/vehicles` - Manage vehicles (add, edit, delete)
- `/owner/bookings` - View and manage booking requests
- `/owner/verification` - Submit verification documents

### Renter Pages

- `/renter` - Browse available vehicles
- `/renter/bookings` - View and manage bookings
- `/profile` - User profile (accessible to all roles)

## 🔄 Migration from Old Dashboard

### Before (Old Structure)

```
/dashboard?view=admin-dashboard
/dashboard?view=owner-dashboard
/dashboard?view=renter-browse
```

### After (New Structure)

```
/admin
/owner
/renter
```

**Note:** The old `/dashboard` page is now **deprecated**. All redirects go to role-specific routes.

## 💡 Usage Examples

### Example 1: Admin User Journey

1. Login with admin credentials
2. Redirected to `/admin` (shows analytics)
3. Click "User Management" → `/admin/users`
4. Click "Verifications" → `/admin/verifications`

### Example 2: Vehicle Owner Journey

1. Login as vehicle owner
2. Redirected to `/owner` (shows dashboard)
3. Click "My Vehicles" → `/owner/vehicles`
4. Click "Booking Requests" → `/owner/bookings`

### Example 3: Renter Journey

1. Login as renter
2. Redirected to `/renter` (shows browse vehicles)
3. Find vehicle, click to book
4. Click "My Bookings" → `/renter/bookings`

## 🛡️ Security Features

1. **Route-Level Protection** - Entire route folders protected by layout
2. **Role Verification** - Layout checks user role on every page
3. **Auto-Redirect** - Wrong role → correct dashboard
4. **Auth Check** - No auth → login page

## 🎓 Benefits

✅ **Clear Separation** - Each role has isolated area
✅ **Better UX** - Users only see relevant features
✅ **Improved Security** - Route-level protection
✅ **Scalability** - Easy to add new features per role
✅ **Maintainability** - Clear code organization
✅ **SEO-Friendly** - Clean URLs without query params
✅ **Type-Safe** - TypeScript protection throughout

## 🚀 Next Steps

### To Add New Admin Feature:

1. Create file: `app/admin/feature-name/page.tsx`
2. Add link in: `app/admin/layout.tsx`
3. Use component: `@/components/admin/feature-name`

### To Add New Owner Feature:

1. Create file: `app/owner/feature-name/page.tsx`
2. Add link in: `app/owner/layout.tsx`
3. Use component: `@/components/owner/feature-name`

### To Add New Renter Feature:

1. Create file: `app/renter/feature-name/page.tsx`
2. Add link in: `app/renter/layout.tsx`
3. Use component: `@/components/renter/feature-name`

## 📝 Notes

- The `/profile` page is accessible to all roles (not role-specific)
- Each layout uses `useAuth()` hook from AuthContext
- Layouts show loading spinner during authentication check
- All components from `components/admin`, `components/owner`, `components/renter` are reused

## 🎉 Result

Your application now has a **professional, scalable, role-based dashboard architecture** that:

- Automatically routes users to the right place
- Shows only relevant features per role
- Protects routes at the layout level
- Provides clean, maintainable code structure
