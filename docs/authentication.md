# Owner authentication boundary

## Current foundation

Clerk is the provisional supported OAuth/passwordless provider because it supports current Next.js and Vercel integration. It is not provisioned or connected in Phase 6B.

Authentication defaults to `AUTH_PROVIDER=disabled`. In that state:

- request proxying performs no provider call;
- every admin layout receives `not-configured` access;
- `/admin` redirects to the configuration/sign-in boundary;
- private catalog queries throw before database access.

When Clerk is configured, the server resolves its authenticated identity and grants access only if the normalized primary email is in `OWNER_EMAILS`. A valid Clerk session that is not allowlisted is forbidden.

## Required owner/provider configuration

1. Owner approves Clerk or requests another supported provider.
2. Create a nonproduction Clerk application.
3. Disable public sign-up and restrict allowed identity methods/domains as appropriate.
4. Set `AUTH_PROVIDER=clerk`.
5. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` through the staging environment—not Git.
6. Set `OWNER_EMAILS` to the exact owner-controlled email address(es).
7. Verify unauthenticated, authenticated-but-not-allowlisted, and allowlisted access in staging.
8. Configure production separately only during an authorized future phase.

No password, provider key, owner identity, public registration, or seed account is committed.
