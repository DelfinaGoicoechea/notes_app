import type { Politeness } from "../types/announce";

export const LIVE_REGION_IDS = {
  polite: "a11y-live-polite",
  assertive: "a11y-live-assertive",
} as const;

/**
 * Screen-reader channel only. Updates the live region in the DOM immediately
 * (no React state), so it is not racing a later paint/focus frame.
 *
 * Use "assertive" for action feedback when focus may also move — VoiceOver
 * routinely drops polite status updates that compete with a focus change.
 */
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

  // Clear + reflow + set so assistive tech detects a change, including
  // when the same string is announced again. No timers.
  region.textContent = "";
  void region.offsetHeight;
  region.textContent = message;
}
