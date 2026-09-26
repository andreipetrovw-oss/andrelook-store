import "server-only";

import { PrismaClient } from "@prisma/client";

import { getServerConfig } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  andrelookPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.andrelookPrisma) {
    return globalForPrisma.andrelookPrisma;
  }

  const databaseUrl = getServerConfig().databaseUrl;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  void databaseUrl;
  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.andrelookPrisma = client;
  }

  return client;
}
