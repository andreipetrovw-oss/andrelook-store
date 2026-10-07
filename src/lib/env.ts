import "server-only";

import { z } from "zod";

const urlSchema = z.url();

export type AuthProvider = "disabled" | "clerk";

export type ServerConfig = {
  authProvider: AuthProvider;
  clerkPublishableKey: string | null;
  clerkSecretKey: string | null;
  crmUrl: URL | null;
  databaseUrl: string | null;
  indexingEnabled: boolean;
  storefrontReviewMode: boolean;
  ownerEmails: string[];
  orderNotificationFrom: string | null;
  orderNotificationTo: string;
  resendApiKey: string | null;
  siteUrl: URL;
};

function optionalValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseOwnerEmails(value: string | undefined): string[] {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function getServerConfig(): ServerConfig {
  const authProviderValue = process.env.AUTH_PROVIDER?.trim() || "disabled";
  if (authProviderValue !== "disabled" && authProviderValue !== "clerk") {
    throw new Error("AUTH_PROVIDER must be either disabled or clerk.");
  }

  const rawSiteUrl =
    optionalValue(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000";
  if (!urlSchema.safeParse(rawSiteUrl).success) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  const requestedReviewMode = process.env.STOREFRONT_REVIEW_MODE === "true";
  const stagingReviewProjectId = optionalValue(
    process.env.STAGING_REVIEW_PROJECT_ID,
  );
  const currentVercelProjectId = optionalValue(process.env.VERCEL_PROJECT_ID);
  const isLocalReview =
    rawSiteUrl.startsWith("http://localhost:") ||
    rawSiteUrl.startsWith("http://127.0.0.1:");
  const isBoundStagingProject = Boolean(
    stagingReviewProjectId && currentVercelProjectId === stagingReviewProjectId,
  );

  const config: ServerConfig = {
    authProvider: authProviderValue,
    clerkPublishableKey: optionalValue(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    clerkSecretKey: optionalValue(process.env.CLERK_SECRET_KEY),
    crmUrl: optionalValue(process.env.CRM_URL)
      ? new URL(process.env.CRM_URL!.trim())
      : null,
    databaseUrl: optionalValue(process.env.DATABASE_URL),
    indexingEnabled: process.env.INDEXING_ENABLED === "true",
    storefrontReviewMode:
      requestedReviewMode && (isLocalReview || isBoundStagingProject),
    ownerEmails: parseOwnerEmails(process.env.OWNER_EMAILS),
    orderNotificationFrom: optionalValue(process.env.ORDER_NOTIFICATION_FROM),
    orderNotificationTo:
      optionalValue(process.env.ORDER_NOTIFICATION_TO) ??
      "info.andrelook@gmail.com",
    resendApiKey: optionalValue(process.env.RESEND_API_KEY),
    siteUrl: new URL(rawSiteUrl),
  };

  if (
    config.authProvider === "clerk" &&
    (!config.clerkPublishableKey ||
      !config.clerkSecretKey ||
      config.ownerEmails.length === 0)
  ) {
    throw new Error(
      "Clerk authentication requires publishable/secret keys and at least one OWNER_EMAILS entry.",
    );
  }

  return config;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(optionalValue(process.env.DATABASE_URL));
}
