import { getPrivateSourceImage } from "@/lib/catalog/private-query";
import { OwnerAuthorizationError } from "@/lib/auth/server";

const ALLOWED_HOSTS = new Set(["photo.yupoo.com"]);
const MAX_IMAGE_BYTES = 20_000_000;

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
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let image;
  try {
    image = await getPrivateSourceImage(id);
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      return errorImage("Требуется вход владельца", 401);
    }
    throw error;
  }
  if (!image) return errorImage("Исходник не найден", 404);

  let source: URL;
  try {
    source = new URL(image.previewUrl ?? image.sourceUrl);
  } catch {
    return errorImage("Некорректный адрес исходника", 422);
  }

  if (source.protocol !== "https:" || !ALLOWED_HOSTS.has(source.hostname)) {
    return errorImage("Источник не разрешён", 403);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const upstream = await fetch(source, {
      cache: "no-store",
      headers: {
        Accept:
          "image/avif,image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8",
        Referer:
          image.product.privateData?.supplierAlbumUrl ?? "https://x.yupoo.com/",
        "User-Agent": "Mozilla/5.0 (compatible; AndrelookOwnerReview/1.0)",
      },
      redirect: "error",
      signal: controller.signal,
    });
    if (!upstream.ok || !upstream.body) {
      return errorImage("Исходник временно недоступен", 502);
    }

    const contentType = upstream.headers.get("content-type")?.split(";")[0];
    const contentLength = Number(upstream.headers.get("content-length") ?? 0);
    if (
      !contentType?.startsWith("image/") ||
      contentType === "image/svg+xml" ||
      (contentLength > 0 && contentLength > MAX_IMAGE_BYTES)
    ) {
      return errorImage("Формат исходника не поддерживается", 415);
    }

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return errorImage("Исходник слишком большой", 413);
    }

    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, max-age=300, no-transform",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return errorImage("Не удалось загрузить исходник", 502);
  } finally {
    clearTimeout(timeout);
  }
}
