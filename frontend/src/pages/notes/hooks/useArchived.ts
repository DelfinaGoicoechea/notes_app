import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import {
  deleteNote,
  getArchivedNotes,
  getArchivedNotesByCategory,
  unarchiveNote,
} from "../../../services/notes.service";
import toast from "react-hot-toast";


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
    } catch (error) {
      console.error("useArchived - Get archived notes failed.", error);
      toast.error("Failed to load archived notes. Please try again.");
    };
  }, [category]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleUnarchive = async (id: number) => {
    try {
      await unarchiveNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useArchived - Unarchive note failed.", error);
      toast.error("Failed to unarchive note. Please try again.");
    };
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useArchived - Delete note failed.", error);
      toast.error("Failed to delete note. Please try again.");
    };
  };

  const handleRefetch = () => {
    handleFetch();
  }

  return {
    notes,
    handleUnarchive,
    handleDelete,
    handleRefetch,
    category,
    setCategory,
  };
}