import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotesList from "./pages/NotesList.jsx";
import NoteForm from "./pages/NoteForm.jsx";
import NoteDetail from "./pages/NoteDetail.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<NotesList />} />
          <Route path="/notes/new" element={<NoteForm mode="create" />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/notes/:id/edit" element={<NoteForm mode="edit" />} />
        </Routes>
      </main>
    </div>
  );
}
