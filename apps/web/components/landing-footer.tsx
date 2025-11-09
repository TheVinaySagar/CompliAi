"use client";

import React from "react";
import CompliAILogo from "@/components/ui/logo";
import { Linkedin, Facebook, Instagram, Twitter } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: "Product",
      links: [
        { label: "Chat Assistant", href: "/chat" },
        { label: "Upload Documents", href: "/upload" },
        { label: "Policy Generator", href: "/policy-generator" },
        { label: "Audit Planner", href: "/audit-planner" },
        { label: "Team Management", href: "/team" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
    features: {
      title: "Features",
      links: [
        { label: "AI Compliance", href: "#" },
        { label: "Document Processing", href: "#" },
        { label: "Policy Automation", href: "#" },
        { label: "Audit Planning", href: "#" },
        { label: "Team Collaboration", href: "#" },
        { label: "Integrations", href: "#" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Careers", href: "#" },
        { label: "Customers", href: "#" },
        { label: "Partners", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    help: {
      title: "Help",
      links: [
        { label: "Support", href: "#" },
        { label: "Documentation", href: "#" },
        { label: "Get a Demo", href: "#" },
        { label: "Templates", href: "#" },
        { label: "Community", href: "#" },
        { label: "Webinars", href: "#" },
      ],
    },
  };

  return (
    <footer className="relative w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-3">
              <CompliAILogo size={28} rounded="lg" />
              <div>
                <span
                  className="font-[900] text-lg text-neutral-900 dark:text-white"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  CompliAI
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  © {currentYear} CompliAI
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Security
              </a>
              <a
                href="#"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
