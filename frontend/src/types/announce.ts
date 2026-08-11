export type Politeness = "polite" | "assertive";

export type Status = { 
  message: string; 
  key: number;
  politeness: Politeness;
};