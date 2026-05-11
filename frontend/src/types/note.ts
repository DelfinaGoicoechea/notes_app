export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  categories?: Category[];
  createdAt: Date;
  updatedAt: Date;
}