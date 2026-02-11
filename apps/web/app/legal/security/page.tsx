import { LandingFooter } from "@/components/landing-footer";
import Link from "next/link";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
                </div>
                <h1 className="text-4xl font-bold mb-8">Security</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p>
                        Security is our top priority at CompliAI. We are committed to protecting your data and ensuring the reliability of our systems.
                    </p>
                    <h3>Data Encryption</h3>
                    <p>
                        All data transmitted between your device and our servers is encrypted using TLS 1.2+. Data at rest is encrypted using AES-256.
                    </p>
                    <h3>Compliance</h3>
                    <p>
                        We adhere to strict compliance standards to ensure your data is handled responsibly and in accordance with applicable regulations.
                    </p>
                    {/* Add more sections as needed */}
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
