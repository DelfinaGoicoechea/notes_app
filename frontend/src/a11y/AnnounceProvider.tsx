import { LIVE_REGION_IDS } from "./announce";

/**
 * Mounts the two live regions used by `announce()`.
 * No React state and no context — regions are updated imperatively.
 */
export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        id={LIVE_REGION_IDS.polite}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id={LIVE_REGION_IDS.assertive}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      {children}
    </>
  );
}
