import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function NoteForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .getNote(id)
        .then((note) => {
          setTitle(note.title);
          setContent(note.content);
          setCategoryId(note.category_id || "");
          setTagsInput(note.tags.join(", "));
        })
        .catch((e) => setError(e.message));
    }
  }, [mode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      content,
      category_id: categoryId ? Number(categoryId) : null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "create") {
        const created = await api.createNote(payload);
        navigate(`/notes/${created.id}`);
      } else {
        await api.updateNote(id, payload);
        navigate(`/notes/${id}`);
      }
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>{mode === "create" ? "New Note" : "Edit Note"}</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="note-form">
        <label className="form-label">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
        </label>

        <label className="form-label">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Tags (comma-separated)
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="input"
            placeholder="EC2, Networking, Deployment"
          />
        </label>

        <label className="form-label">
          Content (plain text or Markdown)
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input textarea"
            rows={14}
          />
        </label>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
