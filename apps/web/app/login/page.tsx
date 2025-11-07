"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // glow state for hover spotlight on the border
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [glowOn, setGlowOn] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login({ email, password });
      if (!success) {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <BackgroundBeamsWithCollision>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[420px] sm:max-w-md lg:max-w-lg w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo className="w-16 h-16 m:w-20 sm:h-20 md:w-20 md:h-20 lg:w-16 lg:h-16 rounded-lg" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                CompliAI
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                AI-Powered Compliance, From Policy to Audit
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg">
            {/* outer gradient border for depth with interactive glow */}
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
                // composite: subtle gradient border plus an optional radial glow at cursor
                backgroundImage: glowOn
                  ? `linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%, rgba(0,0,0,0.04)), radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(99,102,241,0.28), transparent 12%)`
                  : `linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%, rgba(0,0,0,0.04))`,
                transition: "background-image 250ms ease",
              }}
            >
              <div className="shadow-input w-full rounded-2xl bg-white/60 dark:bg-black/40 p-6 md:p-10 backdrop-blur-md border border-white/10 dark:border-neutral-800/40">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Sign in to your account
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Enter your credentials to access the compliance platform
                  </p>
                </div>

                <div className="mt-4">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 sm:space-y-6"
                  >
                    {error && (
                      <Alert variant="destructive" className="text-sm">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="h-10 sm:h-12 text-sm sm:text-base pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={
                        "group/btn relative flex h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]" +
                        (isLoading ? " opacity-80 pointer-events-none" : "")
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>

                  <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Create account
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
