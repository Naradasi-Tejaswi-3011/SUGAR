import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// This protects your entire application with Clerk authentication
export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/auth/signin(.*)',
    '/auth/signup(.*)'
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};