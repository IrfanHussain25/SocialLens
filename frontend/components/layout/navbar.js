"use client";

import Link from "next/link";
import Image from "next/image";
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
            <header className="relative w-full max-w-[1600px] xl:w-[94vw] rounded-full bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.3)] pointer-events-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                <div className="relative flex items-center justify-between px-10 py-2 md:py-3">
                    <div className="flex items-center">
                        <Link href="/" className="relative group">
                            <motion.div
                                className="relative z-10 text-xl lg:text-2xl font-black font-sans tracking-tight text-gray-900 flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Image
                                    src="/Social_lens _logo.png"
                                    alt="Social Lens"
                                    width={360}
                                    height={90}
                                    className="h-10 md:h-12 w-auto object-contain scale-[1.2] md:scale-[1.35] origin-left"
                                    priority
                                />
                            </motion.div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 text-[12px] font-bold font-sans uppercase tracking-[0.15em]">
                        <Link
                            href={isAuthenticated && user ? `/analyze/${user.userId || user.username}` : "/login"}
                            className={`flex items-center gap-1 transition-colors ${pathname.startsWith('/analyze') ? 'text-indigo-600' : 'text-gray-800 hover:text-indigo-600'}`}
                        >
                            Analyze Content <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                        <Link
                            href={isAuthenticated && user ? `/societies/${user.userId || user.username}` : "/login"}
                            className={`flex items-center gap-1 transition-colors ${pathname.startsWith('/societies') ? 'text-indigo-600' : 'text-gray-800 hover:text-indigo-600'}`}
                        >
                            Societies <ChevronRight className="w-3 h-3" strokeWidth={3} />
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-20 h-9 bg-gray-200/50 animate-pulse rounded-full"></div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link href={`/analyze/${user.userId || user.username}`} className="h-9 px-3 rounded-full bg-white/50 backdrop-blur-md flex items-center gap-2 border border-white/60 hover:bg-white/80 transition-all shadow-sm group" title="Profile">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-black flex items-center justify-center shadow-inner">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-gray-800 pr-1 group-hover:text-black transition-colors">
                                        {user.name || (user.email ? user.email.split('@')[0] : 'User')}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogOut}
                                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                    title="Log Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>

                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <CursorAwareButton variant="light" className="cursor-pointer">
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