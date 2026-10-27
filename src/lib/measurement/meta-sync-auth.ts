import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function syncAuthorized(header: string | null) {
  return [process.env.CRON_SECRET, process.env.META_SYNC_TRIGGER_SECRET]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s && s.length >= 16))
    .some((secret) =>
      timingSafeEqual(
        createHash("sha256")
          .update(header ?? "")
          .digest(),
        createHash("sha256").update(`Bearer ${secret}`).digest(),
      ),
    );
}
