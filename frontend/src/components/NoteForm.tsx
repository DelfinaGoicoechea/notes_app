import React, { useRef, useState } from "react";
import Spinner from "./Spinner";
import { createTextareaSubmitHandler } from "../utils/formKeyHandler";
import { EMPTY_TITLE_MESSAGE, useRequiredTitle } from "../hooks/useRequiredTitle";
import { useNotes } from "../pages/notes/hooks/useNotes";


export default function NoteForm() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { createNote } = useNotes();

  const {
    showError,
    handleTitleChange,
    validateTitle,
    resetTitleValidation,
    titleInputClassName,
  } = useRequiredTitle(title);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {  
    e.preventDefault();
    if(!validateTitle()) return;
    setIsCreating(true);
    try {
      await createNote({ title, content });
      setTitle("");
      setContent("");
      
      resetTitleValidation();
      requestAnimationFrame(() => {
        titleRef.current?.focus();
      });
    } catch {
      // Context handles user-facing errors.
    } finally {
      setIsCreating(false);
    };
  };

  const handleTextareaKeyDown = createTextareaSubmitHandler(formRef);

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      className="max-w-xl flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="note-title" className="text-base font-medium">Note Title</label>
        <input
          id="note-title"
          ref={titleRef}
          className={titleInputClassName}
          placeholder="e.g. Shopping list"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value, setTitle)}
          disabled={isCreating}
          autoComplete="off"
        />
        {showError && (
          <p className="text-xs text-red-500">{EMPTY_TITLE_MESSAGE}</p>
        )}
      </div>

      <label htmlFor="note-content" className="sr-only">Note content</label>
      <textarea
        id="note-content"
        className="border rounded-md px-3 py-2 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-gray-400"
        placeholder="e.g. Buy milk, bread, and eggs"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isCreating}
        onKeyDown={handleTextareaKeyDown}
      />

      <button
        type="submit"
        disabled={isCreating}
        aria-label="Create"
        className="self-start bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {isCreating && <Spinner />}
        {isCreating ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}