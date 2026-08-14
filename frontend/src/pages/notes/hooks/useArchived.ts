import { useCallback, useEffect, useState } from "react";
import type { Note } from "../../../types/note";
import {
  deleteNote,
  getArchivedNotes,
  unarchiveNote,
} from "../../../services/notes.service";
import { announce } from "../../../a11y/announce";
import { notifyError } from "../../../utils/notifyError";

export function useArchived(){
  const [notes, setNotes] = useState<Note[]>([]);
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unarchivingNoteId, setUnarchivingNoteId] = useState<number | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const handleFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const trimmedCategory = category.trim() || undefined;
      const trimmedSearch = search.trim() || undefined;

      const response = await getArchivedNotes(trimmedCategory, trimmedSearch);
      setNotes(response);
    } catch (error) {
      console.error("useArchived - Get archived notes failed.", error);
      const message = "Failed to load archived notes.";
      notifyError(`${message}` + " Please try again.", { id: "load-archived-notes-error" });
      announce(message, "assertive");
    } finally {
      setIsLoading(false);
    };
  }, [category, search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleFetch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [handleFetch]);

  const handleUnarchive = async (id: number): Promise<boolean> => {
    setUnarchivingNoteId(id);
    try {
      await unarchiveNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      console.error("useArchived - Unarchive note failed.", error);
      const message = "Failed to unarchive note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      return false;
    } finally {
      setUnarchivingNoteId(null);
    };
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    setDeletingNoteId(id);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch(error) {
      console.error("useArchived - Delete note failed.", error);
      const message = "Failed to delete note.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
      return false;
    } finally {
      setDeletingNoteId(null);
    };
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  return {
    notes,
    handleUnarchive,
    handleDelete,
    handleNoteUpdated,
    category,
    setCategory,
    isLoading,
    unarchivingNoteId,
    deletingNoteId,
    search,
    setSearch,
  };
}
