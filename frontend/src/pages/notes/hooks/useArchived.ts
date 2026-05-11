import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import {
  deleteNote,
  getArchivedNotes,
  getArchivedNotesByCategory,
  unarchiveNote,
} from "../../../services/notes.service";


export function useArchived(){
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");

  const handleFetch = useCallback(async () => {
    try {
      const trimmed = category.trim();
      const response = trimmed
        ? await getArchivedNotesByCategory(trimmed)
        : await getArchivedNotes();
      setNotes(response);
    } catch (err) {
      console.error("Failed to fetch archived notes", err);
    }
  }, [category]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleArchive = async (id: number) => {
    await unarchiveNote(id);
    await handleFetch();
  };

  const handleDelete = async (id: number) => {
    await deleteNote(id);
    await handleFetch();
  };

  const handleRefetch = () => {
    handleFetch();
  }

  return {
    notes,
    handleArchive,
    handleDelete,
    handleRefetch,
    category,
    setCategory,
  };
}