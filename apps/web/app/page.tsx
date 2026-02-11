"use client";

import React, { useState } from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import CompliAILogo from "@/components/ui/logo";
import { LandingFooter } from "@/components/landing-footer";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-100 pointer-events-none">
        <BackgroundBeams />
      </div>

      <div className="relative z-10 w-full overflow-x-hidden">
        {/* Navbar */}
        <nav className="fixed top-6 inset-x-0 mx-auto max-w-2xl z-50 px-4">
          <div className="relative flex items-center justify-between bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-full px-6 py-3 border border-neutral-200 dark:border-white/5 shadow-xl dark:shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <CompliAILogo size={24} rounded="md" />
              <span className="text-neutral-900 dark:text-white font-bold text-lg tracking-tight">
                CompliAI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#home"
                className="text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm"
              >
                About
              </a>
              {!user && (
                <a
                  href="/login"
                  className="text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm"
                >
                  Sign in
                </a>
              )}
              <button
                onClick={() => router.push(user ? "/dashboard" : "/register")}
                className="px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                {user ? "Dashboard" : "Get Started"}
              </button>
              <ModeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-neutral-200 dark:border-white/5 shadow-2xl">
              <div className="flex flex-col gap-4">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-neutral-900 dark:text-white/80 hover:text-neutral-600 dark:hover:text-white font-medium">Home</a>
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-neutral-900 dark:text-white/80 hover:text-neutral-600 dark:hover:text-white font-medium">About</a>
                <button onClick={() => { setMobileMenuOpen(false); router.push(user ? "/dashboard" : "/register"); }} className="w-full py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-medium text-center">
                  {user ? "Dashboard" : "Get Started"}
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1
              className="text-5xl md:text-8xl font-bold tracking-tighter text-neutral-900 dark:text-white mb-8"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Automate your <br />
              compliance.
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Replace manual audits, policy application, and compliance checks with a single AI-powered platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => router.push(user ? "/dashboard" : "/register")}
                className="h-12 px-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Start Verification
              </button>
              <div className="text-neutral-500 text-sm">
                Free forever • No credit card
              </div>
            </div>

          </motion.div>

          {/* Feature Tags (Minimal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-5xl"
          >
            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center text-sm text-neutral-500 font-medium">
              {[
                "Projects", "Chat", "AI Agents", "Time Tracking", "Calendar",
                "Dashboards", "Compliance", "Policy Generator", "Audit Planner",
                "Automations", "Scheduling"
              ].map((feature, idx) => (
                <span key={idx} className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-default">
                  {feature}
                </span>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <div className="relative z-20 border-t border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <LandingFooter />
        </div>
      </div>
    </div>
  );
}
