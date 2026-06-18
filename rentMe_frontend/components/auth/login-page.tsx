"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

interface LoginPageProps {
  onLoginSuccess: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await onLoginSuccess(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel – branding ───────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">rentMe</span>
        </div>

        {/* Middle copy */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-snug">
            Drive what you need,<br />when you need it.
          </h1>
          <p className="text-primary-foreground/70 text-base leading-relaxed max-w-sm">
            Connect with verified vehicle owners near you. Trusted rentals, transparent pricing, zero hassle.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Verified Owners", "Instant Booking", "24/7 Support"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white border border-white/20"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} rentMe · Vehicle Rental Platform
        </p>
      </div>

      {/* ── Right panel – form ──────────────────────────────────── */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[380px] space-y-7">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">rentMe</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue to your account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Google */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-primary hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}