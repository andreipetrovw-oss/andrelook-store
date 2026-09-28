import { get } from "@vercel/blob";

import { OwnerAuthorizationError } from "@/lib/auth/server";
import { getPrivateStudioCandidate } from "@/lib/catalog/private-query";

function errorImage(message: string, status: number) {
  const safeMessage = message.replace(/[<>&"]/g, "");
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#ede9e2"/><text x="400" y="500" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#625e58">${safeMessage}</text></svg>`;
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let candidate;
  try {
    candidate = await getPrivateStudioCandidate(id);
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      return errorImage("Требуется вход владельца", 401);
    }
    throw error;
  }
  if (!candidate) return errorImage("Версия Studio не найдена", 404);

  try {
    if (!process.env.STUDIO_STORE_ID) {
      return errorImage("Хранилище Studio не настроено", 503);
    }
    const result = await get(candidate.privateBlobUrl, {
      access: "private",
      storeId: process.env.STUDIO_STORE_ID,
      useCache: false,
    });
    if (!result || result.statusCode !== 200) {
      return errorImage("Версия Studio временно недоступна", 502);
    }
    if (!result.blob.contentType.startsWith("image/")) {
      return errorImage("Формат версии Studio не поддерживается", 415);
    }
    return new Response(result.stream, {
      headers: {
        "Cache-Control": "private, no-store, no-transform",
        "Content-Length": String(result.blob.size),
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return errorImage("Не удалось загрузить версию Studio", 502);
  }
}
