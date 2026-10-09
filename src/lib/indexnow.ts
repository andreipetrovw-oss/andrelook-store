export const indexNowKey = "a883274803f59d872f0d0069f9b708ef";

const publicLocalePath = /^\/(?:et|ru|en)(?:\/|$)/;
const privatePath = /^\/(?:admin|api|sign-in)(?:\/|$)/;

export function canonicalIndexNowUrls(
  candidates: Iterable<string>,
  siteUrl: URL,
) {
  const urls = new Set<string>();
  for (const candidate of candidates) {
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      continue;
    }
    if (
      url.origin !== siteUrl.origin ||
      url.protocol !== "https:" ||
      !publicLocalePath.test(url.pathname) ||
      privatePath.test(url.pathname) ||
      url.search ||
      url.hash
    ) {
      continue;
    }
    urls.add(url.toString());
  }
  return [...urls].sort();
}

export function indexNowPayload(urls: string[], siteUrl: URL) {
  return {
    host: siteUrl.host,
    key: indexNowKey,
    keyLocation: new URL(`/${indexNowKey}.txt`, siteUrl).toString(),
    urlList: urls,
  };
}
