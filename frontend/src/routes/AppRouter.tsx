import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ActiveNotesPage } from "../pages/notes/ActiveNotesPage";
import { ArchivedNotesPage } from "../pages/notes/ArchivedNotesPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<ActiveNotesPage />} />
          <Route path="/archived" element={<ArchivedNotesPage />} />
        </Routes>
    </BrowserRouter>
  );
}