"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isLoading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();

            setUser({
                ...currentUser,
                ...attributes, // Adds email, name, etc.
            });
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial check on mount
        checkUser();

        // Listen for auth events from Amplify (like login/logout anywhere in the app)
        const unsubscribe = Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case "signedIn":
                    checkUser();
                    break;
                case "signedOut":
                    setUser(null);
                    break;
                case "tokenRefresh":
                    checkUser();
                    break;
                case "tokenRefresh_failure":
                case "signIn_failure":
                    setUser(null);
                    break;
            }
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
