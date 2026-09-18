import { Link } from "react-router-dom";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated 1 day ago";
  return `Updated ${days} days ago`;
}

export default function NoteCard({ note }) {
  const preview =
    note.content.length > 140 ? note.content.slice(0, 140) + "…" : note.content;

  return (
    <Link to={`/notes/${note.id}`} className="note-card">
      <h3 className="note-card-title">{note.title}</h3>
      <p className="note-card-preview">{preview}</p>
      <div className="note-card-meta">
        {note.category_name && (
          <span className="badge badge-category">{note.category_name}</span>
        )}
        {note.tags?.map((tag) => (
          <span key={tag} className="badge badge-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="note-card-footer">{timeAgo(note.updated_at)}</div>
    </Link>
  );
}
