import { SIZE_HELP_VALUE } from "./request-constants";

export function selectionSummary({
  colour,
  neutralPrompt,
  size,
  sizingAssistance,
}: {
  colour?: string;
  neutralPrompt: string;
  size: string;
  sizingAssistance: string;
}) {
  const selectedSize = size === SIZE_HELP_VALUE ? sizingAssistance : size;
  return [colour, selectedSize].filter(Boolean).join(" · ") || neutralPrompt;
}
