import { LandingFooter } from "@/components/landing-footer";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
                </div>
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        At CompliAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.
                    </p>
                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.
                    </p>
                    <h3>2. How We Use Information</h3>
                    <p>
                        We use the information we collect to operate, maintain, and improve our services, including our AI-powered compliance tools.
                    </p>
                    <h3>3. Data Security</h3>
                    <p>
                        We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    {/* Add more sections as needed */}
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
