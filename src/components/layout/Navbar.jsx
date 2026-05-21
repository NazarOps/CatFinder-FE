import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCatModeStore } from "../../store/catModeStore";

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const catMode = useCatModeStore((s) => s.catMode);
  const toggleCatMode = useCatModeStore((s) => s.toggle);

  useEffect(() => {
    document.body.classList.toggle("cat-mode", catMode);
  }, [catMode]);

  return (
    <header>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          CatFinder
        </Link>

        <div className="navbar-links">
          <NavLink to="/advertisements" end>Annonser</NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/advertisements/create">Skapa annons</NavLink>
              <NavLink to="/saved">Sparade</NavLink>
            </>
          )}
        </div>

        <div className="navbar-right">
          <button
            onClick={toggleCatMode}
            title={catMode ? "Inaktivera Cat Mode" : "Aktivera Cat Mode"}
            style={{
              background: catMode ? "#fff7ed" : "none",
              border: `1px solid ${catMode ? "#fed7aa" : "#e5e7eb"}`,
              color: catMode ? "#f97316" : "#9ca3af",
              borderRadius: 999,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.03em",
              transition: "all 0.2s ease",
            }}
          >
            {catMode ? "Cat Mode: Pa" : "Cat Mode: Av"}
          </button>

          {isAuthenticated ? (
            <button className="btn secondary" onClick={logout}>
              Logga ut
            </button>
          ) : (
            <>
              <Link className="navbar-auth-link" to="/login">
                Logga in
              </Link>
              <Link className="btn btn-orange" to="/register">
                Registrera
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
