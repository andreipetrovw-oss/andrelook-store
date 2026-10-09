import { canonicalIndexNowUrls, indexNowPayload } from "../src/lib/indexnow";

async function main() {
  const siteUrl = new URL(
    process.env.INDEXNOW_SITE_URL ?? "https://www.andrelook.store",
  );
  if (siteUrl.origin !== "https://www.andrelook.store") {
    throw new Error(
      "IndexNow submissions are restricted to https://www.andrelook.store.",
    );
  }

  const sitemapUrl = new URL("/sitemap.xml", siteUrl);
  const sitemapResponse = await fetch(sitemapUrl);
  if (!sitemapResponse.ok) {
    throw new Error(`Sitemap request failed with ${sitemapResponse.status}.`);
  }

  const sitemap = await sitemapResponse.text();
  const candidates = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(
    (match) => (match[1] ? [match[1].replaceAll("&amp;", "&")] : []),
  );
  const urls = canonicalIndexNowUrls(candidates, siteUrl);
  if (urls.length === 0) {
    throw new Error("No canonical public URLs were found in the sitemap.");
  }

  const payload = indexNowPayload(urls, siteUrl);
  if (process.env.INDEXNOW_DRY_RUN === "true") {
    console.log(JSON.stringify({ ...payload, urlCount: urls.length }, null, 2));
    return;
  }

  const keyResponse = await fetch(payload.keyLocation);
  const keyBody = keyResponse.ok ? (await keyResponse.text()).trim() : "";
  if (!keyResponse.ok || keyBody !== payload.key) {
    throw new Error("The production IndexNow key endpoint is not ready.");
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json; charset=utf-8" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`IndexNow submission failed with ${response.status}.`);
  }
  console.log(
    JSON.stringify(
      { status: response.status, submitted: urls.length },
      null,
      2,
    ),
  );
}

void main();
