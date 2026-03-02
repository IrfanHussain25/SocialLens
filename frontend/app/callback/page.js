"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Authenticating...");

    useEffect(() => {
        // Amplify automatically handles the token exchange in the background when it sees the code in the URL.
        // We just need to wait for it to finish and then verify the user session exists.
        const checkAuthStatus = async () => {
            try {
                // Just calling getCurrentUser forces Amplify to check for valid tokens
                console.log("Checking auth status...");
                const user = await getCurrentUser();
                console.log("User: ", user);
                setStatus("Authentication successful! Redirecting...");

                // Brief delay for UX, then redirect
                setTimeout(() => {
                    const userId = user?.userId || user?.username || 'me';
                    router.push(`/analyze/${userId}`);
                }, 1000);

            } catch (error) {
                console.error("Callback authentication error:", error);
                // If we fail to get the user, they aren't logged in properly or token exchange failed.
                setStatus("Authentication failed. Redirecting to login...");
                setTimeout(() => {
                    router.push("/login?error=auth_failed");
                }, 2000);
            }
        };

        checkAuthStatus();
    }, [router]);

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-gray-300 font-medium animate-pulse">{status}</p>
            </div>
        </main>
    );
}