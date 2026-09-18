import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("kv-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kv-theme", theme);
  }, [theme]);

  return (
    <header className="navbar">
      <div className="navbar-brand">Knowledge Vault</div>
      <nav className="navbar-links">
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/notes" className="nav-link">
          Notes
        </NavLink>
      </nav>
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}
