"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// using local markup for a glowy bordered card (matches login page style)
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const { register, user, isLoading, error: authError, clearError } = useAuth();
  const router = useRouter();

  // glow state for hover spotlight on the border (match login page behavior)
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [glowOn, setGlowOn] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Clear auth errors when component mounts or form data changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Combine local and auth errors
  const displayError = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError(); // Clear any existing auth errors

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.agreeToTerms) {
      setLocalError("Please agree to the terms of service");
      return;
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: true,
      });

      if (success) {
        // Registration successful, user will be automatically redirected to dashboard
        // by the useEffect that monitors user state
        console.log("Registration successful!");
      }
      // Error handling is done in the auth context
    } catch (err) {
      setLocalError("An error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (localError) {
      setLocalError("");
    }
    if (authError) {
      clearError();
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength < 2)
      return { level: "Weak", color: "text-destructive", width: "20%" };
    if (strength < 4)
      return {
        level: "Medium",
        color: "text-yellow-600 dark:text-yellow-400",
        width: "60%",
      };
    return {
      level: "Strong",
      color: "text-green-600 dark:text-green-400",
      width: "100%",
    };
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

  if (user) {
    return null;
  }

  return (
    <BackgroundBeamsWithCollision>
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <Logo className="h-12 w-12 sm:h-16 sm:w-16 text-primary rounded-lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Compli<span className="text-foreground">AI</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
              AI-Powered Compliance, From Policy to Audit
            </p>
          </div>

          <div className="mx-auto w-full max-w-lg">
            {/* outer gradient border for depth with interactive glow (matches login) */}
            <div
              ref={wrapperRef}
              className="p-1 rounded-3xl"
              onMouseMove={(e) => {
                const rect = (
                  e.currentTarget as HTMLDivElement
                ).getBoundingClientRect();
                setGlowPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
              onMouseEnter={() => setGlowOn(true)}
              onMouseLeave={() => setGlowOn(false)}
              style={{
                backgroundImage: glowOn
                  ? `linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%, rgba(0,0,0,0.04)), radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(99,102,241,0.28), transparent 12%)`
                  : `linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%, rgba(0,0,0,0.04))`,
                transition: "background-image 250ms ease",
              }}
            >
              <div className="shadow-input w-full rounded-2xl bg-white/60 dark:bg-black/40 p-6 md:p-10 backdrop-blur-md border border-white/10 dark:border-neutral-800/40">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Create your account
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Get started with CompliAI compliance management
                  </p>
                </div>

                <div className="mt-4">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    {displayError && (
                      <Alert
                        variant="destructive"
                        className="text-sm sm:text-base"
                      >
                        <AlertDescription>{displayError}</AlertDescription>
                      </Alert>
                    )}
                    {/* Name Field */}
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm sm:text-base">
                        Full name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {/* Email Field */}
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm sm:text-base">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    {/* Password Field */}
                    <div className="space-y-1">
                      <Label
                        htmlFor="password"
                        className="text-sm sm:text-base"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base pr-10"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {formData.password && passwordStrength && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span className="text-muted-foreground">
                              Password strength:
                            </span>
                            <span className={passwordStrength.color}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                            <div
                              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.level === "Weak"
                                  ? "bg-destructive"
                                  : passwordStrength.level === "Medium"
                                  ? "bg-yellow-500 dark:bg-yellow-400"
                                  : "bg-green-500 dark:bg-green-400"
                              }`}
                              style={{ width: passwordStrength.width }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use 8+ characters with uppercase, lowercase, numbers
                            & symbols
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm sm:text-base"
                      >
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base pr-10"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreeToTerms", checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-xs sm:text-sm leading-snug"
                      >
                        I agree to the{" "}
                        <Link
                          href="#"
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="#"
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>

                  <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
