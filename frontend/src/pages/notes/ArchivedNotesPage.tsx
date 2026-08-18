import { Notes } from "./components/Notes"
import { useArchived } from "./hooks/useArchived";



export const ArchivedNotesPage = () => {
  const {
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
    setSearch
  } = useArchived();

  return (
    <Notes 
      title="Archived Notes" 
      showForm={false}
      notes={notes} 
      handleArchive={handleUnarchive}
      handleDelete={handleDelete}
      handleNoteUpdated={handleNoteUpdated}
      category={category}
      setCategory={setCategory}
      isLoading={isLoading}
      archivingNoteId={unarchivingNoteId}
      deletingNoteId={deletingNoteId}
      search={search}
      setSearch={setSearch}
    />
  )
}
