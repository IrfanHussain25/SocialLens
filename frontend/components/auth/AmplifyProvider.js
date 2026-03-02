"use client";

import { Amplify } from "aws-amplify";
import { useEffect } from "react";
import { defaultStorage } from "aws-amplify/utils";



// Configure Amplify
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_CLIENT_ID,
            loginWith: {
                oauth: {
                    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN.replace('https://', ''),
                    scopes: ['email', 'openid', 'profile'],
                    redirectSignIn: [process.env.NEXT_PUBLIC_BASE_URL + "/callback", "http://localhost:3000/callback"],
                    redirectSignOut: [process.env.NEXT_PUBLIC_BASE_URL + "/login", "http://localhost:3000/login"],
                    responseType: 'code',
                }
            }
        }
    },
}, {
    ssr: true // Tells Amplify to store tokens in cookies so the Next.js server can read them
});

export function AmplifyProvider({ children }) {
    // We only need to render the children. The configuration happens outside the component
    // so it's initialized once when the module loads on the client side.

    // An optional useEffect to log successful initialization in dev mode
    useEffect(() => {
        console.log("Amplify configured successfully on client");
    }, []);

    return <>{children}</>;
}
