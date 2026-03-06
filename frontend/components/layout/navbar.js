"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, User, LogOut } from "lucide-react";
import { CursorAwareButton } from "../CursorAwareButton";
import { useAuth } from "@/components/auth/AuthContext";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Hide navbar on auth routes, callback, and dashboard
    if (pathname === "/login" || pathname === "/signup" || pathname === "/callback" || pathname.startsWith("/dashboard")) return null;

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
            {/* Container with premium glass effect: higher opacity for better contrast on white backgrounds */}
            <header className="relative w-full max-w-[1600px] xl:w-[94vw] rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none" />

                <div className="relative flex items-center justify-between px-8 py-4">
                    {/* Left Section: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="relative group">
                            <motion.div
                                className="relative z-10 text-2xl font-bold font-sans tracking-tight text-gray-950 px-4 py-2"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                Social Lens

                                {/* Glossy Bulge Background */}
                                <motion.div
                                    className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 -z-10 border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                                    initial={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                />
                            </motion.div>
                        </Link>
                    </div>

                    {/* Center Section: Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8 text-[12px] font-bold font-sans uppercase tracking-[0.15em] text-gray-800">
                        <Link href={isAuthenticated && user ? `/analyze/${user.userId || user.username}` : "/login"} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            Analyze Content <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                        <Link href={isAuthenticated && user ? `/societies/${user.userId || user.username}` : "/login"} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            Societies <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                        
                    </nav>

                    {/* Right Section: Action Buttons */}
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-20 h-9 bg-gray-200/50 animate-pulse rounded-full"></div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link href={`/analyze/${user.userId || user.username}`} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-white transition-colors" title="Profile">
                                    <User className="w-4 h-4 text-gray-600" />
                                </Link>
                                <button
                                    onClick={handleLogOut}
                                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Log Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                               
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <CursorAwareButton variant="light">
                                        Log In
                                    </CursorAwareButton>
                                </Link>
                                
                            </>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}