import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from './lib/amplifyServerUtils';

export async function middleware(request) {
    const response = NextResponse.next();

    // If we are accessing the dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const session = await runWithAmplifyServerContext({
            nextServerContext: { request, response },
            operation: async (contextSpec) => {
                try {
                    const authSession = await fetchAuthSession(contextSpec);
                    if (
                        authSession.tokens?.accessToken !== undefined &&
                        authSession.tokens?.idToken !== undefined
                    ) {
                        return authSession;
                    }
                    return null;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        });

        if (session) {
            const userId = session.tokens.idToken?.payload?.sub || session.tokens.idToken?.payload?.['cognito:username'] || 'me';
            const newPath = request.nextUrl.pathname.replace('/dashboard', `/analyze/${userId}`);
            return NextResponse.redirect(new URL(newPath, request.url));
        }

        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
