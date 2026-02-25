"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Navbar() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full mt-6 px-4 pointer-events-none">
            {/* Container with highly translucent white background and strong backdrop-blur to create a floating glass capsule */}
            <header className="relative w-full max-w-[1600px] xl:w-[94vw] rounded-full bg-white/10 backdrop-blur-2xl border border-white/30 shadow-lg pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full pointer-events-none" />

                <div className="relative flex items-center justify-between px-8 py-4">
                    {/* Left Section: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold font-sans tracking-tight text-gray-950 lowercase">
                            social lens
                        </Link>
                    </div>

                    {/* Center Section: Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8 text-[12px] font-bold font-sans uppercase tracking-[0.15em] text-gray-800">
                        <Link href="#" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            Analyze Content <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            SOCIETIES <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            DASHBOARD <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                    </nav>

                    {/* Right Section: Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="#"
                            className="px-6 py-2.5 rounded-full text-sm font-medium font-sans border border-gray-300 bg-white/50 hover:bg-white text-gray-900 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/dashboard/analytics"
                            className="px-6 py-2.5 rounded-full text-sm font-medium font-sans bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all"
                        >
                            Experience Social Lens
                        </Link>
                    </div>
                </div>
            </header>
        </div>
    );
}
