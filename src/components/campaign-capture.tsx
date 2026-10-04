"use client";

import { useEffect } from "react";

export function CampaignCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("andrelookCampaign")) return;
      const query = new URLSearchParams(window.location.search);
      sessionStorage.setItem(
        "andrelookCampaign",
        JSON.stringify({
          initialReferrer: document.referrer.slice(0, 1000),
          landingPath:
            `${window.location.pathname}${window.location.search}`.slice(
              0,
              500,
            ),
          utmCampaign: query.get("utm_campaign")?.slice(0, 200) ?? "",
          utmContent: query.get("utm_content")?.slice(0, 200) ?? "",
          utmMedium: query.get("utm_medium")?.slice(0, 100) ?? "",
          utmSource: query.get("utm_source")?.slice(0, 100) ?? "",
          utmTerm: query.get("utm_term")?.slice(0, 200) ?? "",
        }),
      );
    } catch {
      // Privacy/browser settings may block session storage; ordering still works.
    }
  }, []);
  return null;
}
