"use client";

import React, { useState } from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import CompliAILogo from "@/components/ui/logo";
import { LandingFooter } from "@/components/landing-footer";

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
    <div className="relative min-h-screen overflow-x-hidden max-w-screen">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 md:px-6 py-6 md:py-6 mb-12 md:mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <CompliAILogo size={32} rounded="lg" />
            <span
              className="text-white font-[900] text-xl"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              CompliAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              About
            </a>
            {user && (
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/settings")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                    {getInitials(user.name)}
                  </div>
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-2 rounded-lg bg-white text-neutral-900 font-medium hover:bg-white/90 transition-all shadow-lg"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 p-4 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20">
            <div className="flex flex-col gap-4">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white transition-colors py-2 font-medium"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white transition-colors py-2 font-medium"
              >
                About
              </a>
              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="text-white/90 hover:text-white transition-colors py-2 font-medium text-left"
                >
                  Dashboard
                </button>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push("/settings");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                      {getInitials(user.name)}
                    </div>
                    <span>{user.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="px-6 py-2 rounded-lg bg-white text-neutral-900 font-medium hover:bg-white/90 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Wavy Background */}
      <WavyBackground className="max-w-7xl mx-auto pb-40">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl text-white font-[900] text-center mb-6"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Maximize human productivity
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-normal text-center max-w-2xl mb-8">
            Replace all your software. Every app, AI agent, and human in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
            <button
              onClick={() => router.push(user ? "/dashboard" : "/register")}
              className="px-8 py-3 rounded-lg bg-neutral-900 text-white font-semibold text-lg hover:bg-neutral-800 transition-all shadow-lg"
            >
              {user ? "Go to Dashboard" : "Get started. It's FREE!"}
            </button>
          </div>
          <p className="text-white/60 text-sm">Free forever. No credit card.</p>

          {/* Feature Tags */}
          <div className="mt-16 text-center mb-6">
            <p className="text-white/70 text-sm uppercase tracking-wider mb-4">
              GET 400% MORE DONE • CUSTOMIZE YOUR WORKSPACE
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl">
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Projects
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Chat
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              AI Agents
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Time Tracking
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Calendar
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Dashboards
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Compliance Management
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Policy Generator
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Audit Planner
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Automations
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              Scheduling
            </span>
          </div>
        </div>
      </WavyBackground>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
