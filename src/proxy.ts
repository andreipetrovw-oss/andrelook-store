import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Next.js Server Actions POST back to the protected route. Let Clerk attach
    // its request context without converting that internal POST into a sign-in
    // redirect; every admin action independently calls requireActiveAdmin and
    // therefore still fails closed before reading or mutating data.
    const isServerAction =
      request.method === "POST" && request.headers.has("next-action");
    if (isServerAction) return NextResponse.next();

    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("reason", "unauthenticated");
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (process.env.AUTH_PROVIDER !== "clerk") {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("reason", "not-configured");
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: ["/admin/:path*", "/sign-in/:path*"],
};
