import { Amplify } from "aws-amplify";
import { defaultStorage } from "aws-amplify/utils";


Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_CLIENT_ID,
            loginWith: {
                oauth: {
                    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN.replace('https://', ''),
                    scopes: ['email', 'openid', 'profile'],
                    redirectSignIn: [process.env.NEXT_PUBLIC_BASE_URL + "/callback"],
                    redirectSignOut: [process.env.NEXT_PUBLIC_BASE_URL + "/login"],
                    responseType: 'code',
                }
            }
        }
    },
});