import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import { archiveNote, deleteNote, getActiveNotes, getActiveNotesByCategory } from "../../../services/notes.service";
import toast from "react-hot-toast";


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
    } catch (error) {
      console.error("useActive - Get active notes failed.", error);
      toast.error("Failed to load notes. Please try again.", { 
        id: 'load-active-notes-error' 
      });
    };
  }, [category]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleFetch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [handleFetch]);

  const handleArchive = async (id: number) => {
    try {
      await archiveNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useActive - Archive note failed.", error);
      toast.error("Failed to archive note. Please try again.");
    };
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id);
      await handleFetch();
    } catch(error) {
      console.error("useActive - Delete note failed.", error);
      toast.error("Failed to delete note. Please try again.");
    };
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