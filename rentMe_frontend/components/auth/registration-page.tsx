"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, RegistrationFormData } from "@/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Mail, Lock, Phone, User, Calendar, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface RegistrationPageProps {
  onRegistrationSuccess: (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth?: string;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
}

const STEPS = ["Personal Info", "Account Setup"];

export function RegistrationPage({ onRegistrationSuccess, onSwitchToLogin }: RegistrationPageProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
  });

  const handleNext = async () => {
    const valid = await trigger(["fullName", "email", "phoneNumber"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setSubmitError("");
    try {
      await onRegistrationSuccess({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      });
    } catch (err: any) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-secondary px-12 py-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">rentMe</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-snug">
            Start earning with<br />your vehicle today.
          </h1>
          <p className="text-secondary-foreground/70 text-base leading-relaxed max-w-sm">
            List your vehicle, set your own schedule, and earn money from renters in your area.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {[
              "Free to list your vehicle",
              "Verified renters only",
              "Secure payments & support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white/80 shrink-0" />
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} rentMe · Vehicle Rental Platform
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-md">
              <Car className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">rentMe</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Create account</h2>
            <p className="text-sm text-muted-foreground">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Error */}
          {submitError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input {...register("fullName")} placeholder="John Doe" className="pl-9 h-11" />
                  </div>
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input {...register("email")} type="email" placeholder="you@example.com" className="pl-9 h-11" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input {...register("phoneNumber")} type="tel" placeholder="+94771234567" className="pl-9 h-11" />
                  </div>
                  {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}
                </div>

                <Button type="button" onClick={handleNext} className="w-full h-11 gap-2 font-semibold">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                {/* Date of birth */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Date of birth <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input {...register("dateOfBirth")} type="date" className="pl-9 h-11" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register("password")}
                      type={showPw ? "text" : "password"}
                      placeholder="At least 8 characters"
                      className="pl-9 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register("confirmPassword")}
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="Repeat password"
                      className="pl-9 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-11 gap-2"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1 h-11 font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}