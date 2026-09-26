import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
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
    return NextResponse.next();
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: ["/admin/:path*", "/sign-in/:path*"],
};
