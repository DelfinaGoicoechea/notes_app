import { LIVE_REGION_IDS } from "./announce";

/**
 * Mounts the two live regions used by `announce()`.
 */
export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        id={LIVE_REGION_IDS.polite}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      />
      <div
        id={LIVE_REGION_IDS.assertive}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      />
      {children}
    </>
  );
}
