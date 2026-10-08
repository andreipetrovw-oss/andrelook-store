export function routeNeedsClerk(path: string, isCrmHost: boolean) {
  return (
    isCrmHost ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/sign-in" ||
    path.startsWith("/sign-in/") ||
    path.startsWith("/__clerk/")
  );
}
