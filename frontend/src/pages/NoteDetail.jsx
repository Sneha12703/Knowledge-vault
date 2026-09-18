import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getNote(id).then(setNote).catch((e) => setError(e.message));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.deleteNote(id);
      navigate("/notes");
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!note) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{note.title}</h1>
        <div className="button-group">
          <Link to={`/notes/${id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="note-card-meta">
        {note.category_name && (
          <span className="badge badge-category">{note.category_name}</span>
        )}
        {note.tags.map((tag) => (
          <span key={tag} className="badge badge-tag">
            {tag}
          </span>
        ))}
      </div>

      <article className="note-content">{note.content}</article>

      <p className="note-timestamps">
        Created {new Date(note.created_at).toLocaleString()} · Updated{" "}
        {new Date(note.updated_at).toLocaleString()}
      </p>

      <Link to="/notes" className="back-link">
        ← Back to Notes
      </Link>
    </div>
  );
}
