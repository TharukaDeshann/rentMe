'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { Car, LayoutDashboard, FileCheck, CheckCircle, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/owner',              label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/owner/vehicles',     label: 'My Vehicles',       icon: Car },
  { href: '/owner/bookings',     label: 'Booking Requests',  icon: FileCheck },
  { href: '/owner/verification', label: 'Verification',      icon: CheckCircle },
];

/**
 * Vehicle Owner Layout
 * Full sidebar + header layout using the design-system CSS variables.
 */
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== UserRole.VEHICLE_OWNER) {
        router.push(user?.role === UserRole.ADMIN ? '/admin' : '/renter');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== UserRole.VEHICLE_OWNER) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-5 border-b border-sidebar-border shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary shadow-sm">
            <Car className="h-4 w-4 text-secondary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">rentMe</span>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-sidebar-border">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
            Vehicle Owner
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn('nav-link', isActive && 'active')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <Link href="/profile" className="nav-link mb-1">
            <User className="h-4 w-4 shrink-0" />
            Profile
          </Link>
          <button
            onClick={() => logout()}
            className="nav-link w-full text-left hover:!text-destructive hover:!bg-destructive/8"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 shrink-0">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
              <Car className="h-3.5 w-3.5 text-secondary-foreground" />
            </div>
            <span className="font-bold text-foreground">rentMe</span>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn('topnav-link', pathname === href && 'active')}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: user info */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[180px]">
              {user.email}
            </span>
            <Avatar className="h-8 w-8 ring-2 ring-secondary/20">
              <AvatarFallback className="text-xs font-semibold bg-secondary text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="hidden md:flex text-muted-foreground hover:text-destructive hover:bg-destructive/8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}