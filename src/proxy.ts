import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routeNeedsClerk } from "@/lib/auth/routing";

const clerkProxy = clerkMiddleware();

function hostname(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(":")[0]!
    .toLowerCase();
}

function crmOrigin() {
  const value = process.env.CRM_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const crmUrl = crmOrigin();
  const isCrmHost = crmUrl
    ? hostname(request) === new URL(crmUrl).hostname
    : false;
  const path = request.nextUrl.pathname;

  if (isCrmHost && path === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (
    isCrmHost &&
    crmUrl &&
    path !== "/admin" &&
    !path.startsWith("/admin/") &&
    path !== "/sign-in" &&
    !path.startsWith("/sign-in/") &&
    !path.startsWith("/__clerk/") &&
    !path.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/admin", crmUrl));
  }

  if (
    !isCrmHost &&
    crmUrl &&
    (path === "/admin" ||
      path.startsWith("/admin/") ||
      path === "/sign-in" ||
      path.startsWith("/sign-in/"))
  ) {
    const destination = new URL(path, crmUrl);
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination);
  }

  if (process.env.AUTH_PROVIDER !== "clerk") {
    return NextResponse.next();
  }

  if (!routeNeedsClerk(path, isCrmHost)) {
    return NextResponse.next();
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
