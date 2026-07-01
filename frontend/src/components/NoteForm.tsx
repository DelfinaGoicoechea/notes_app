import React, { useState } from "react";
import { createNote } from "../services/notes.service";
import toast from "react-hot-toast";

interface NoteFormProps {
  onCreated: () => void;
}

export default function NoteForm({ onCreated }: NoteFormProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await createNote({ title, content });
      setTitle("");
      setContent("");
      
      onCreated();
    } catch(error) {
      console.error("NoteForm - Create note failed.", error);
      toast.error("Failed to create note. Please try again.");
    };
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl flex flex-col gap-4"
    >
      <input
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border rounded-md px-3 py-2 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        type="submit"
        className="self-start bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
      >
        Create
      </button>
    </form>
  );
}