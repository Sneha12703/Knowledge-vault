const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getDashboard: () => request("/dashboard"),

  getNotes: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return request(`/notes${qs ? `?${qs}` : ""}`);
  },
  getNote: (id) => request(`/notes/${id}`),
  createNote: (note) =>
    request("/notes", { method: "POST", body: JSON.stringify(note) }),
  updateNote: (id, note) =>
    request(`/notes/${id}`, { method: "PUT", body: JSON.stringify(note) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: "DELETE" }),

  getCategories: () => request("/categories"),
  getTags: () => request("/tags"),
};
