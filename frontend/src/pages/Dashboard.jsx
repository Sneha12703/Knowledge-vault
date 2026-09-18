import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/notes/new" className="btn btn-primary">
          + New Note
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{data.total_notes}</div>
          <div className="stat-label">Total Notes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.total_categories}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      <h2 className="section-heading">Recently Updated</h2>
      {data.recent_notes.length === 0 ? (
        <p className="empty-state">
          No notes yet. <Link to="/notes/new">Create your first one</Link>.
        </p>
      ) : (
        <ul className="recent-list">
          {data.recent_notes.map((note) => (
            <li key={note.id}>
              <Link to={`/notes/${note.id}`}>{note.title}</Link>
              {note.category_name && (
                <span className="badge badge-category">
                  {note.category_name}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
