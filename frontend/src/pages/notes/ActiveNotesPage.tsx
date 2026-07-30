import { Notes } from "./components/Notes"
import { useActive } from "./hooks/useActive"



export const ActiveNotesPage = () => {
  const {
    notes,
    handleArchive,
    handleDelete,
    handleNoteUpdated,
    handleNoteCreated,
    category,
    setCategory,
    isLoading,
    archivingNoteId,
    deletingNoteId,
    search,
    setSearch
  } = useActive();

  return (
    <Notes 
      title="Active Notes" 
      showForm={true}
      notes={notes} 
      handleArchive={handleArchive}
      handleDelete={handleDelete}
      handleNoteUpdated={handleNoteUpdated}
      handleNoteCreated={handleNoteCreated}
      category={category}
      setCategory={setCategory}
      isLoading={isLoading}
      archivingNoteId={archivingNoteId}
      deletingNoteId={deletingNoteId}
      search={search}
      setSearch={setSearch}
    />
  )
}
