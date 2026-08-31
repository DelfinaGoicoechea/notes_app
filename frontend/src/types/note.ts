export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export type NoteInput = { title: string; content: string }
