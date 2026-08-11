import { createContext, useEffect } from "react";
import { useAnnounce } from "../hooks/useAnnounce";
import type { Politeness } from "../types/announce";
import { registerAnnouncer } from "./announcer";

const AnnounceContext = createContext<(
  message: string, politeness?: Politeness) => void
  >(() => {});

export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  const { announce, Announcer } = useAnnounce();

  useEffect(() => {
    registerAnnouncer(announce);
    return () => registerAnnouncer(() => {});  
  }, [announce]);

  return (
    <AnnounceContext.Provider value={announce}>
      {Announcer}
      {children}
    </AnnounceContext.Provider>
  );
};