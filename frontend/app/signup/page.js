"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signUp, confirmSignUp, signIn, getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { CursorAwareButton } from "@/components/CursorAwareButton";

const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

const ErrorMessage = ({ message }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="flex items-center gap-1.5 mt-1.5 text-red-500 text-[13px] font-medium"
            >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [authStep, setAuthStep] = useState("SIGN_UP"); // SIGN_UP | CONFIRM_SIGN_UP
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleError = (error) => {
        let msg = error.message || "An error occurred.";
        if (msg.startsWith("Password did not conform with policy: ")) {
            msg = msg.replace("Password did not conform with policy: ", "");
        }
        
        if (error.name === 'InvalidPasswordException' || msg.toLowerCase().includes('password')) {
            setFieldErrors({ password: msg });
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user already exists')) {
            setFieldErrors({ email: msg });
        } else if (authStep === 'CONFIRM_SIGN_UP') {
            setFieldErrors({ verificationCode: msg });
        } else {
            setFieldErrors({ email: msg }); // Fallback
        }
    };

    const handleStandardSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

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
                try {
                    const { userId, username } = await getCurrentUser();
                    router.push(`/analyze/${userId || username || email || "me"}`);
                } catch {
                    router.push(`/analyze/${email || "me"}`);
                }
            } else if (nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
                setAuthStep("CONFIRM_SIGN_UP");
            }
        } catch (error) {
            console.error("SignUp error:", error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        try {
            const { isSignUpComplete } = await confirmSignUp({
                username: email,
                confirmationCode: verificationCode
            });

            if (isSignUpComplete) {
                // Registration is fully complete. Auto sign-in and direct to dashboard.
                await signIn({
                    username: email,
                    password
                });
                const { userId, username } = await getCurrentUser();
                router.push(`/analyze/${userId || username || "me"}`);
            }
        } catch (error) {
            console.error("Confirm SignUp error:", error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden font-sans relative flex items-center justify-center">

            {/* Exact Sarvam replica background gradient from Hero Section */}
            <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none flex justify-center z-0">
                <div className="absolute top-[-10%] w-[150vw] max-w-[2500px] h-[800px] opacity-80 blur-[60px]" style={{ background: 'radial-gradient(50% 100% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
                <div className="absolute top-[-5%] w-[100vw] max-w-[1500px] h-[500px] opacity-90 blur-[80px]" style={{ background: 'radial-gradient(50% 100% at 50% 0%, #FFB472 0%, rgba(255,180,114,0) 100%)' }}></div>
            </div>

            <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="w-full max-w-[480px] px-6 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 w-full flex flex-col justify-center mx-auto relative overflow-hidden">

                    <div className="text-center mb-5">
                        <h1 className="text-2xl font-serif font-medium text-gray-900 mb-1">
                            {authStep === "SIGN_UP" ? "Create an Account" : "Verify Email"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {authStep === "SIGN_UP" ? "Join Social Lens today" : `We sent a code to ${email}`}
                        </p>
                    </div>

                    {authStep === "SIGN_UP" ? (
                        <>
                            <form className="space-y-3.5" onSubmit={handleStandardSignUp}>
                                <motion.div
                                    animate={fieldErrors.name ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: "" })); }}
                                        placeholder="Satoshi Nakamoto"
                                        className={`w-full px-4 py-2.5 rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder:text-gray-400 text-[15px] ${fieldErrors.name ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                                        required
                                    />
                                    <ErrorMessage message={fieldErrors.name} />
                                </motion.div>
                                <motion.div
                                    animate={fieldErrors.email ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: "" })); }}
                                        placeholder="you@company.com"
                                        className={`w-full px-4 py-2.5 rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder:text-gray-400 text-[15px] ${fieldErrors.email ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                                        required
                                    />
                                    <ErrorMessage message={fieldErrors.email} />
                                </motion.div>
                                <motion.div
                                    animate={fieldErrors.password ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <label className="block text-[14px] font-serif font-medium text-gray-900 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: "" })); }}
                                            placeholder="••••••••"
                                            className={`w-full px-4 py-2.5 rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder:text-gray-400 text-[15px] ${fieldErrors.password ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-white px-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <ErrorMessage message={fieldErrors.password} />
                                </motion.div>

                                <CursorAwareButton type="submit" disabled={isLoading} variant="dark" className="w-full mt-4 flex items-center justify-center gap-3 !py-3 !rounded-xl !text-[15px] disabled:opacity-75">
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                                    </span>
                                </CursorAwareButton>
                            </form>

                            <p className="mt-4 text-center text-[13px] text-gray-500 relative z-20">
                                Already have an account? <Link href="/login" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer">Log in</Link>
                            </p>
                        </>
                    ) : (
                        <form className="space-y-4" onSubmit={handleConfirmSignUp}>
                            <motion.div
                                className="mt-4"
                                animate={fieldErrors.verificationCode ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <label className="block text-[15px] font-serif font-medium text-gray-900 mb-1.5 text-center">Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => { setVerificationCode(e.target.value); setFieldErrors(prev => ({ ...prev, verificationCode: "" })); }}
                                    placeholder="000000"
                                    className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 ${fieldErrors.verificationCode ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                                    required
                                    maxLength={6}
                                />
                                <ErrorMessage message={fieldErrors.verificationCode} />
                            </motion.div>

                            <CursorAwareButton type="submit" disabled={isLoading} variant="dark" className="w-full mt-6 flex items-center justify-center gap-3 !py-3.5 !rounded-xl !text-base disabled:opacity-75">
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Email <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                </span>
                            </CursorAwareButton>

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
