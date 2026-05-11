import { Notes } from "./components/Notes"
import { useArchived } from "./hooks/useArchived";



export const ArchivedNotesPage = () => {
  const {notes, handleArchive, handleDelete, handleRefetch, category, setCategory} = useArchived();

  return (
    <Notes 
      title="Archived Notes" 
      showForm={false}
      notes={notes} 
      handleArchive={handleArchive}
      handleDelete={handleDelete}
      handleRefetch={handleRefetch}
      category={category}
      setCategory={setCategory}
    />
  )
}
