import { useCallback, useState } from "react";
import type { Politeness, Status } from "../types/announce";

export function useAnnounce() {
  const [status, setStatus] = useState<Status>({ 
    message: "", 
    key: 0, 
    politeness: "polite" 
  });

  const announce = useCallback(
    (message: string, politeness:Politeness = "polite") => {
      setStatus((s) => ({message: "", key: s.key + 1, politeness}));

      window.setTimeout(() => {
        setStatus((s) => ({ ...s, message }));
      }, 50);
  }, []);

  const Announcer = (
    <div
      key={status.key}
      role={status.politeness === "assertive" ? "alert" : "status"}
      aria-live={status.politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {status.message}
    </div>
  );

  return { announce, Announcer };
};