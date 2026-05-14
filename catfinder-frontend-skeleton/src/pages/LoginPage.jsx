import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await login(form);
      navigate("/advertisements");
    } catch {
      alert("Fel email eller lösenord.");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">CatFinder</p>
          <h1>Logga in</h1>
          <p>
            Logga in för att skapa annonser, kommentera och spara annonser.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>

            <input
              className="input"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={updateField}
            />
          </div>

          <div className="auth-field">
            <label>Lösenord</label>

            <input
              className="input"
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={updateField}
            />
          </div>

          <button className="btn btn-orange">
            Logga in
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Har du inget konto?
            <Link to="/register"> Registrera dig</Link>
          </p>
        </div>
      </div>
    </section>
  );
}