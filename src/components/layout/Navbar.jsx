import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const isAuthenticated = useAuthStore(
  (state) => state.isAuthenticated
);

  const logout = useAuthStore(
  (state) => state.logout
);
  return (
    <header>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          CatFinder
        </Link>

        <div className="navbar-links">
          <NavLink to="/advertisements">Annonser</NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/advertisements/create">
                Skapa annons
              </NavLink>

              <NavLink to="/saved">
                Sparade
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-right">
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