import { BackgroundBeams } from "@/components/ui/background-beams";
import { LandingFooter } from "@/components/landing-footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CompliAILogo from "@/components/ui/logo";

export default function AboutPage() {
    return (
        <div className="relative min-h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-100 pointer-events-none">
                <BackgroundBeams />
            </div>

            <div className="relative z-10 w-full overflow-x-hidden flex flex-col min-h-screen">
                <nav className="fixed top-6 inset-x-0 mx-auto max-w-2xl z-50 px-4">
                    <div className="relative flex items-center justify-between bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-full px-6 py-3 border border-neutral-200 dark:border-white/5 shadow-xl dark:shadow-2xl">
                        <Link href="/" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <CompliAILogo size={20} rounded="sm" />
                            <span className="hidden sm:inline text-neutral-900 dark:text-white font-bold text-sm tracking-tight">CompliAI</span>
                        </div>
                    </div>
                </nav>

                <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-neutral-900 dark:text-white mb-8">
                        About CompliAI
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed max-w-2xl">
                        We are building the future of compliance. Our mission is to replace manual, error-prone processes with intelligent, automated systems.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 text-left w-full">
                        <div className="p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Our Vision</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                To create a world where compliance is not a burden, but a strategic advantage. We envision AI agents handling the complexity of regulations, allowing humans to focus on innovation.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Our Technology</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Powered by advanced LLMs and proprietary verification engines, CompliAI understands context, generates precise policies, and plans audits with superhuman accuracy.
                            </p>
                        </div>
                    </div>
                </main>

                <div className="relative z-20 border-t border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                    <LandingFooter />
                </div>
            </div>
        </div>
    );
}
