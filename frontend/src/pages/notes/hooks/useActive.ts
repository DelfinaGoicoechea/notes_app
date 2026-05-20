import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import { archiveNote, deleteNote, getActiveNotes, getActiveNotesByCategory } from "../../../services/notes.service";


export function useActive(){
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");

  const handleFetch = useCallback(async () => {
    try {
      const trimmed = category.trim();
      const response = trimmed
        ? await getActiveNotesByCategory(trimmed)
        : await getActiveNotes();
      setNotes(response);
    } catch (err) {
      console.error("Failed to fetch active notes", err);
    }
  }, [category]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleArchive = async (id: number) => {
    await archiveNote(id);
    await handleFetch();
  };

  const handleDelete = async (id: number) => {
    await deleteNote(id);
    await handleFetch();
  };

  const handleRefetch = () => {
    handleFetch();
  };

  return {
    notes,
    handleArchive,
    handleDelete,
    handleRefetch,
    category,
    setCategory,
  };
}