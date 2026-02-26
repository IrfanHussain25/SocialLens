"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Hide navbar on auth routes and callback
    if (pathname === "/login" || pathname === "/signup" || pathname === "/callback") return null;

    const handleLogOut = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full mt-6 px-4 pointer-events-none">
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
                        <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            DASHBOARD <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                    </nav>

                    {/* Right Section: Action Buttons */}
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-20 h-9 bg-gray-200/50 animate-pulse rounded-full"></div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-white transition-colors" title="Profile">
                                    <User className="w-4 h-4 text-gray-600" />
                                </Link>
                                <button
                                    onClick={handleLogOut}
                                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Log Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                                <Link
                                    href="/dashboard/analytics"
                                    className="hidden sm:flex px-6 py-2.5 rounded-full text-sm font-medium font-sans bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all"
                                >
                                    New Analysis
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-6 py-2.5 rounded-full text-sm font-medium font-sans border border-gray-300 bg-white/50 hover:bg-white text-gray-900 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-6 py-2.5 rounded-full text-sm font-medium font-sans bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Experience Social Lens
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}
