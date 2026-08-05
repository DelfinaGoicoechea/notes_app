import React, { useRef, useState } from "react";
import { createNote } from "../services/notes.service";
import type { Note } from "../types/note";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import { createTextareaSubmitHandler } from "../utils/formKeyHandler";

interface NoteFormProps {
  onCreated: (createdNote: Note) => void;
}

export default function NoteForm({ onCreated }: NoteFormProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const createdNote = await createNote({ title, content });
      setTitle("");
      setContent("");
      
      onCreated(createdNote);
      requestAnimationFrame(() => {
        titleRef.current?.focus();
      });
    } catch(error) {
      console.error("NoteForm - Create note failed.", error);
      toast.error("Failed to create note. Please try again.");
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
      <label htmlFor="note-title" className="sr-only">Note title</label>
      <input
        id="note-title"
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isCreating}
        ref={titleRef}
      />

      <label htmlFor="note-content" className="sr-only">Note content</label>
      <textarea
        id="note-content"
        className="border rounded-md px-3 py-2 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isCreating}
        onKeyDown={handleTextareaKeyDown}
      />

      <button
        type="submit"
        disabled={isCreating}
        className="self-start bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating && <Spinner />}
        {isCreating ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}