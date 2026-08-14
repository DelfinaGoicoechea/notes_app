import type { Politeness } from "../types/announce";

export const LIVE_REGION_IDS = {
  polite: "a11y-live-polite",
  assertive: "a11y-live-assertive",
} as const;


export function announce(
  message: string,
  politeness: Politeness = "polite"
): void {
  const id =
    politeness === "assertive"
      ? LIVE_REGION_IDS.assertive
      : LIVE_REGION_IDS.polite;

  const region = document.getElementById(id);
  if (!region) return;

  region.textContent = "";
  void region.offsetHeight;
  region.textContent = message;
}
