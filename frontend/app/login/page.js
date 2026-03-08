"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signIn, confirmSignIn, getCurrentUser } from "aws-amplify/auth";
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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState("SIGN_IN"); // SIGN_IN | CONFIRM_MFA
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleError = (error) => {
    let msg = error.message || "An error occurred.";
    if (msg.startsWith("Password did not conform with policy: ")) {
      msg = msg.replace("Password did not conform with policy: ", "");
    }

    if (error.name === 'NotAuthorizedException' || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('username or password')) {
      setFieldErrors({ password: msg });
    } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user does not exist')) {
      setFieldErrors({ email: msg });
    } else if (authStep === 'CONFIRM_MFA') {
       setFieldErrors({ mfaCode: msg });
    } else {
      // Fallback to a general error on the topmost field
      setFieldErrors({ email: msg });
    }
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await signIn({
        username: email,
        password,
      });

      console.log("Cognito signIn response:", response);
      const { isSignedIn, nextStep } = response;

      if (isSignedIn) {
        console.log("User is signed in. Redirecting to /analyze...");
        const { userId, username } = await getCurrentUser();
        router.push(`/analyze/${userId || username || "me"}`);
      } else if (nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP" || nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_MFA") {
        setAuthStep("CONFIRM_MFA");
      } else {
        // Unhandled step
        console.warn("Unhandled nextStep:", nextStep);
        setFieldErrors({ email: `Login requires further action: ${nextStep?.signInStep}` });
      }
    } catch (error) {
      console.error("Login error:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await signIn({
        username: "irfanh2502@gmail.com",
        password: "Password@123",
      });

      console.log("Guest signIn response:", response);
      const { isSignedIn, nextStep } = response;

      if (isSignedIn) {
        console.log("Guest is signed in. Redirecting to /analyze...");
        const { userId, username } = await getCurrentUser();
        router.push(`/analyze/${userId || username || "me"}`);
      } else if (nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP" || nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_MFA") {
        setAuthStep("CONFIRM_MFA");
      } else {
        console.warn("Unhandled nextStep for guest:", nextStep);
        setFieldErrors({ email: `Guest login requires further action: ${nextStep?.signInStep}` });
      }
    } catch (error) {
      console.error("Guest login error:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaConfirm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: mfaCode
      });
      if (isSignedIn) {
        const { userId, username } = await getCurrentUser();
        router.push(`/analyze/${userId || username || "me"}`);
      }
    } catch (error) {
      console.error("MFA confirm error:", error);
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
              {authStep === "SIGN_IN" ? "Welcome Back" : "Two-Factor Auth"}
            </h1>
            <p className="text-gray-500">
              {authStep === "SIGN_IN" ? "Sign in to Social Lens to continue" : "Enter the code generated by your app"}
            </p>
          </div>

          {authStep === "SIGN_IN" ? (
            <>
              <form className="space-y-4" onSubmit={handleStandardLogin}>
                <motion.div
                  animate={fieldErrors.email ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block text-[15px] font-serif font-medium text-gray-900 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: "" })); }}
                    placeholder="you@company.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder:text-gray-400 ${fieldErrors.email ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                    required
                  />
                  <ErrorMessage message={fieldErrors.email} />
                </motion.div>
                
                <motion.div
                  animate={fieldErrors.password ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[15px] font-serif font-medium text-gray-900">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: "" })); }}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder:text-gray-400 ${fieldErrors.password ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                      required
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

                <CursorAwareButton type="submit" disabled={isLoading} variant="dark" className="w-full mt-4 flex items-center justify-center gap-3 !py-3.5 !rounded-xl !text-base disabled:opacity-75 cursor-pointer">
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                  </span>
                </CursorAwareButton>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full mt-3 group relative flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-gray-50 to-white text-gray-900 border border-gray-200/80 rounded-xl font-medium text-base overflow-hidden transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] hover:border-gray-300 flex-col disabled:opacity-75 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4C3FF]/20 via-[#FFB472]/10 to-[#D4C3FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex flex-col items-center">
                    <span className="font-semibold flex items-center gap-2 group-hover:text-indigo-950 transition-colors">
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login as Guest"}
                    </span>
                    <span className="text-xs text-gray-500 font-normal mt-1 group-hover:text-gray-600 transition-colors">Explore the app without an account</span>
                  </span>
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                Don't have an account? <Link href="/signup" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">Sign up</Link>
              </p>
            </>
          ) : (
            <form className="space-y-4" onSubmit={handleMfaConfirm}>
              <motion.div
                className="mt-4"
                animate={fieldErrors.mfaCode ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <label className="block text-[15px] font-serif font-medium text-gray-900 mb-1.5 text-center">Authentication Code</label>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => { setMfaCode(e.target.value); setFieldErrors(prev => ({ ...prev, mfaCode: "" })); }}
                  placeholder="000000"
                  className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-white/60 focus:bg-white focus:outline-none focus:ring-2 transition-all text-gray-900 ${fieldErrors.mfaCode ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 focus:ring-gray-950/20 focus:border-gray-950'}`}
                  required
                  maxLength={6}
                />
                <ErrorMessage message={fieldErrors.mfaCode} />
              </motion.div>

              <CursorAwareButton type="submit" disabled={isLoading} variant="dark" className="w-full mt-6 flex items-center justify-center gap-3 !py-3.5 !rounded-xl !text-base disabled:opacity-75">
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </span>
              </CursorAwareButton>

              <button type="button" onClick={() => setAuthStep("SIGN_IN")} className="w-full mt-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                Cancel
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </main>
  );
}
