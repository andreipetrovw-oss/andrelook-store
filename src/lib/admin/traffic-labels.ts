import type { TrafficSourceCode } from "@/lib/attribution/types";

export const trafficSourceLabels: Record<TrafficSourceCode, string> = {
  AI_CHATGPT: "AI / ChatGPT",
  BING_ORGANIC: "Bing — органика",
  DIRECT: "Прямой переход",
  EMAIL: "Email",
  FACEBOOK_ORGANIC: "Facebook — органика",
  GOOGLE_ADS: "Google Ads",
  GOOGLE_ORGANIC: "Google — органика",
  INSTAGRAM_ORGANIC: "Instagram — органика",
  MARKETPLACE: "Маркетплейс",
  META_ADS: "Meta Ads",
  OTHER: "Другой",
  PARTNER: "Партнёр",
  REFERRAL: "Реферальный переход",
  TELEGRAM: "Telegram",
  UNKNOWN: "Неизвестно",
};
