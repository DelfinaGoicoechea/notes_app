import { useState } from "react";

export function useAnnounce() {
  const [status, setStatus] = useState<{ 
    message: string, 
    key: number 
  }>({ message: "", key: 0 });

  const announce = (message: string) => {
    setStatus((s) => ({message: "", key: s.key + 1}));

    window.setTimeout(() => {
      setStatus((s) => ({ ...s, message }));
    }, 50);
  };

  const Announcer = (
    <div
      key={status.key}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {status.message}
    </div>
  );

  return { announce, Announcer };
};