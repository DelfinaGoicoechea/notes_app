import { useContext } from "react";
import { NotesContext } from "../contexts/NotesContext";

export function useNotes() {
  const noteOperations = useContext(NotesContext);

  if(noteOperations === undefined) {
    throw new Error("useNotes must be used with a NotesProvider");
  };

  return noteOperations;
}