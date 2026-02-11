import { LandingFooter } from "@/components/landing-footer";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
                </div>
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Please read these Terms of Service carefully before using our service.
                    </p>
                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using CompliAI, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                    </p>
                    <h3>2. Use of Service</h3>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                    {/* Add more sections as needed */}
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
