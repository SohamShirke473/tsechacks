import Link from "next/link";
import { Leaf, BarChart3, Map } from "lucide-react";

export function Navbar() {
    return (
        <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-stone-900 tracking-tight">
                                Habitat
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <Link
                            href="/analysis"
                            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                        >
                            <Map className="w-4 h-4 mr-2" />
                            Analysis
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {/* Placeholder for future auth/profile */}
                        <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
