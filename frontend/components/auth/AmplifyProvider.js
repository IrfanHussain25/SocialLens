"use client";

import { Amplify } from "aws-amplify";
import { useEffect } from "react";
import { defaultStorage } from "aws-amplify/utils";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_SL_USER_POOL_ID,
            userPoolClientId: process.env.NEXT_PUBLIC_SL_CLIENT_ID,
            loginWith: {
                oauth: {
                    domain: process.env.NEXT_PUBLIC_SL_COGNITO_DOMAIN.replace('https://', ''),
                    scopes: ['email', 'openid', 'profile'],
                    redirectSignIn: [process.env.NEXT_PUBLIC_BASE_URL + "/callback", "http://localhost:3000/callback"],
                    redirectSignOut: [process.env.NEXT_PUBLIC_BASE_URL + "/login", "http://localhost:3000/login"],
                    responseType: 'code',
                }
            }
        }
    },
}, {
    ssr: true
});

export function AmplifyProvider({ children }) {
    useEffect(() => {
        console.log("Amplify configured successfully on client");
    }, []);

    return <>{children}</>;
}
