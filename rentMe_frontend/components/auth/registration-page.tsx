"use client"

import React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registrationSchema, RegistrationFormData } from "@/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Mail, Lock, Phone, User, Calendar, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RegistrationPageProps {
  onRegistrationSuccess: (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth?: string;
  }) => Promise<void>
  onSwitchToLogin: () => void
}

export function RegistrationPage({ onRegistrationSuccess, onSwitchToLogin }: RegistrationPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
  })

  const formData = watch()

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(["fullName", "email", "phoneNumber"])
      if (isValid) {
        setCurrentStep(2)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setSubmitError("")
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    setSubmitError("")
    try {
      await onRegistrationSuccess({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      })
    } catch (err: any) {
      setSubmitError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 p-3 mb-4">
            <div className="rounded-lg bg-primary p-2">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">rentMe</h1>
          <p className="mt-2 text-muted-foreground">Create Your Account</p>
        </div>

        {/* Registration Card */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Join rentMe</CardTitle>
            <CardDescription>Step {currentStep} of 2 - Create your account</CardDescription>
            {/* Progress Bar */}
            <div className="mt-4 flex gap-2">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                currentStep >= 1 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 ? (
              // Step 1: Personal Information
              <form onSubmit={(e) => {
                e.preventDefault()
                handleNextStep()
              }} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...register("fullName")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      placeholder="+1234567890"
                      {...register("phoneNumber")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
                  )}
                  {!errors.phoneNumber && (
                    <p className="text-xs text-muted-foreground">
                      10-20 digits, optionally starting with +
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                    Date of Birth{" "}
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
                >
                  Next Step
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-semibold text-primary hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            ) : (
              // Step 2: Security Information
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Message */}
                {submitError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                    {submitError}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                  {!errors.password && (
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 gap-2 border-border bg-transparent"
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-semibold text-primary hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your information is protected and encrypted
        </p>
      </div>
    </div>
  )
}
