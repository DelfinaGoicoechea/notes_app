import React, { useEffect, useRef, useState } from "react";
import type { Note } from "../types/note";
import { addCategoryToNote, removeCategoryFromNote, updateNote } from "../services/notes.service";
import Spinner from "./Spinner";
import { createTextareaSubmitHandler } from "../utils/formKeyHandler";
import { announce } from "../a11y/announce";
import { notifyError } from "../utils/notifyError";

interface NoteCardProps {
  note: Note;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdated?: (updatedNote: Note) => void;
  archivingNoteId?: number | null;
  deletingNoteId?: number | null;
}

export default function NoteCard({
  note,
  onArchive,
  onDelete,
  onUpdated,
  archivingNoteId,
  deletingNoteId,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(note.title);
  const [content, setContent] = useState<string>(note.content);
  const [newCategory, setNewCategory] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [removingCategoryId, setRemovingCategoryId] = useState<number | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setTitle(note.title);
      setContent(note.content);
    };
  }, [note.title, note.content, isEditing]);

  useEffect(() => {
    if(isEditing) {
      titleRef.current?.focus();
    
      return () => {
        editBtnRef.current?.focus();
      };
    };
  }, [isEditing]);

  const handleSave: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedNote = await updateNote(note.id, { title, content });

      setIsEditing(false);
      onUpdated?.(updatedNote);
    } catch(error) {
      console.error("NoteCard - Update note failed.", error);
      const message = "Failed to save note changes.";
      notifyError(`${message}` + " Please try again.");
      announce(message, "assertive");
    } finally {
      setIsSaving(false);
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => { 
    if(e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    };
  };

  const handleCancel = (): void => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const deferFocus = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => {
      ref.current?.focus();
    })
  };

  const handleTextareaKeyDown = createTextareaSubmitHandler(editFormRef);

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        ref={editFormRef}
        className="border rounded-md p-4 flex flex-col gap-3"
        onKeyDown={handleKeyDown}
      >
        <label htmlFor={`edit-note-title-${note.id}`} className="sr-only">Note title</label>
        <input
          id={`edit-note-title-${note.id}`}
          ref={titleRef}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-gray-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          autoComplete="off"
        />

        <label htmlFor={`edit-note-content-${note.id}`} className="sr-only">Note content</label>
        <textarea
          id={`edit-note-content-${note.id}`}
          className="border rounded-md px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-gray-400"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
          onKeyDown={handleTextareaKeyDown}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            aria-label="Save"
            className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {isSaving && <Spinner />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const categories = note.categories ?? [];

  return (
    <div className="border rounded-md p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-medium">{note.title}</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  setRemovingCategoryId(c.id);
                  try {
                    const updatedNote = await removeCategoryFromNote(note.id, c.name);
                    onUpdated?.(updatedNote);

                    deferFocus(categoryRef);
                  } catch(error) {
                    console.error("NoteCard - Remove category failed.", error);
                    const message = "Failed to remove category.";
                    notifyError(`${message}` + " Please try again.");
                    announce(message, "assertive");
                  } finally {
                    setRemovingCategoryId(null);
                  };
                }}
                disabled={removingCategoryId === c.id}
                className="border rounded-full px-2 py-0.5 text-xs hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                title="Remove category"
                aria-label={`Remove ${c.name} category`}
              >
                {c.name} ×
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const trimmed = newCategory.trim();
            if (!trimmed) return;
            setIsAddingCategory(true);
            try {
              const updatedNote = await addCategoryToNote(note.id, trimmed);
              setNewCategory("");
              onUpdated?.(updatedNote);
              
              deferFocus(categoryRef);
            } catch(error) {
              console.error("NoteCard - Add category failed.", error);
              const message = "Failed to add category.";
              notifyError(`${message}` + " Please try again.");
              announce(message, "assertive");
            } finally {
              setIsAddingCategory(false);
            };
          }}
          className="flex gap-2"
        >
          <label htmlFor={`add-category-${note.id}`} className="sr-only">Add category to note</label>
          <input
            id={`add-category-${note.id}`}
            ref={categoryRef}
            className="border rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-gray-400"
            placeholder="e.g. work"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isAddingCategory}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isAddingCategory}
            aria-label="Add Category"
            className="border px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {isAddingCategory && <Spinner />}
            {isAddingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          id={`edit-btn-${note.id}`}
          onClick={() => setIsEditing(true)}
          ref={editBtnRef}
          className="border px-3 py-1.5 rounded-md hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          aria-label={`Edit ${note.title}`}
        >
          Edit
        </button>

        {onArchive && (
          <button
            type="button"
            onClick={() => onArchive(note.id)}
            disabled={archivingNoteId === note.id}
            aria-busy={archivingNoteId === note.id}
            aria-label={note.archived ? "Unarchive" : "Archive"}
            className="border px-3 py-1.5 rounded-md hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {archivingNoteId === note.id
              ? (note.archived ? "Unarchiving..." : "Archiving...")
              : (note.archived ? "Unarchive" : "Archive")}
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            disabled={deletingNoteId === note.id}
            aria-busy={deletingNoteId === note.id}
            aria-label="Delete"
            className="border px-3 py-1.5 rounded-md hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
          >
            {deletingNoteId === note.id ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}