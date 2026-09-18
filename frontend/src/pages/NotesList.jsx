import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import NoteCard from "../components/NoteCard.jsx";

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCategories().then((c) => setCategories(c)).catch(() => {});
    api.getTags().then((t) => setTags(t)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      api
        .getNotes({ search, category, tag })
        .then(setNotes)
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, category, tag]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notes</h1>
        <Link to="/notes/new" className="btn btn-primary">
          + New Note
        </Link>
      </div>

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="input"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {notes.length === 0 ? (
        <p className="empty-state">No notes match your filters.</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
