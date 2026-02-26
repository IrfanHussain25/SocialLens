"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { signUp, confirmSignUp, signInWithRedirect } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [authStep, setAuthStep] = useState("SIGN_UP"); // SIGN_UP | CONFIRM_SIGN_UP

    const handleStandardSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { isSignUpComplete, nextStep } = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        name: name
                    }
                }
            });

            if (isSignUpComplete) {
                // Technically rare to complete immediately without email verification in standard pools
                router.push("/dashboard");
            } else if (nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
                setAuthStep("CONFIRM_SIGN_UP");
            }
        } catch (error) {
            console.error("SignUp error:", error);
            setErrorMsg(error.message || "An error occurred during registration.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { isSignUpComplete } = await confirmSignUp({
                username: email,
                confirmationCode: verificationCode
            });

            if (isSignUpComplete) {
                // Registration is fully complete. Route them to login so they can formally establish a session.
                router.push("/login");
            }
        } catch (error) {
            console.error("Confirm SignUp error:", error);
            setErrorMsg(error.message || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        setIsLoading(true);
        signInWithRedirect({ provider: "Google" });
    };

    return (
        <main className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden font-sans relative flex items-center justify-center">

            {/* Exact Sarvam replica background gradient from Hero Section */}
            <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none flex justify-center z-0">
                <div className="absolute top-[-10%] w-[150vw] max-w-[2500px] h-[800px] opacity-80 blur-[60px]" style={{ background: 'radial-gradient(50% 100% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
                <div className="absolute top-[-5%] w-[100vw] max-w-[1500px] h-[500px] opacity-90 blur-[80px]" style={{ background: 'radial-gradient(50% 100% at 50% 0%, #FFB472 0%, rgba(255,180,114,0) 100%)' }}></div>
            </div>

            <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="w-full max-w-[480px] px-6 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 w-full aspect-square flex flex-col justify-center mx-auto relative overflow-hidden">

                    <div className="text-center mb-5">
                        <h1 className="text-2xl font-serif font-medium text-gray-900 mb-1">
                            {authStep === "SIGN_UP" ? "Create an Account" : "Verify Email"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {authStep === "SIGN_UP" ? "Join Social Lens today" : `We sent a code to ${email}`}
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                            {errorMsg}
                        </div>
                    )}

                    {authStep === "SIGN_UP" ? (
                        <>
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                                className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-4 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>

                            <div className="flex items-center my-4 gap-4">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Or</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            <form className="space-y-3.5" onSubmit={handleStandardSignUp}>
                                <div>
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Satoshi Nakamoto"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-gray-900 placeholder:text-gray-400 text-[15px]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-gray-900 placeholder:text-gray-400 text-[15px]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-gray-900 placeholder:text-gray-400 text-[15px]"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full mt-4 group relative flex items-center justify-center gap-3 px-8 py-3 bg-gray-950 text-white rounded-xl font-medium text-[15px] overflow-hidden transition-all shadow-xl hover:shadow-2xl disabled:opacity-75">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4A54A6] via-[#A8A1E2] to-[#E5B56D] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                                    </span>
                                </button>
                            </form>

                            <p className="mt-4 text-center text-[13px] text-gray-500 relative z-20">
                                Already have an account? <Link href="/login" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">Log in</Link>
                            </p>
                        </>
                    ) : (
                        <form className="space-y-4" onSubmit={handleConfirmSignUp}>
                            <div className="mt-4">
                                <label className="block text-[15px] font-serif font-medium text-gray-900 mb-1.5 text-center">Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border border-gray-200 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-gray-900"
                                    required
                                    maxLength={6}
                                />
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full mt-6 group relative flex items-center justify-center gap-3 px-8 py-3.5 bg-gray-950 text-white rounded-xl font-medium text-base overflow-hidden transition-all shadow-xl hover:shadow-2xl disabled:opacity-75">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#4A54A6] via-[#A8A1E2] to-[#E5B56D] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Email <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                </span>
                            </button>

                            <button type="button" onClick={() => setAuthStep("SIGN_UP")} className="w-full mt-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                                Cancel
                            </button>
                        </form>
                    )}

                </div>
            </motion.div>
        </main>
    );
}
