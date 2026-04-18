import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes -- everything else requires a Clerk session. Legacy
// enterprise-dashboard routes (under /admin, /check, /policies, etc.) still
// use the older API-key auth flow and are not yet gated here; as we migrate
// them they'll pick up Clerk automatically.

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  // Legacy API-key screens keep their own auth layer for now.
  "/login(.*)",
  "/welcome(.*)",
]);

// Creator Risk Layer surfaces -- these MUST require a Clerk session.
const isCreatorRoute = createRouteMatcher([
  "/me(.*)",
  "/teams/:id(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isCreatorRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
