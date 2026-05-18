import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

// RegisterPage - registreringssida för att skapa nytt konto
export default function RegisterPage() {
  const navigate = useNavigate();

  // State för formulärdata
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Uppdaterar formulärfält när användaren skriver
  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Hanterar registrering av nytt konto
  async function handleSubmit(event) {
    event.preventDefault();

    // Kontrollerar att lösenorden matchar innan request skickas
    if (form.password !== form.confirmPassword) {
      alert("Lösenorden matchar inte.");
      return;
    }

    try {
      // Skickar endast de fält som backendens RegisterDto accepterar
      await authService.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      alert("Konto skapat! Du kan nu logga in.");

      // Navigerar användaren till login-sidan efter lyckad registrering
      navigate("/login");
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message || error
      );

      alert("Kunde inte skapa konto.");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">CatFinder</p>

          <h1>Registrera konto</h1>

          <p>
            Skapa ett konto för att lägga upp annonser, kommentera och spara
            annonser.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Förnamn</label>

            <input
              className="input"
              name="firstName"
              value={form.firstName}
              onChange={updateField}
            />
          </div>

          <div className="auth-field">
            <label>Efternamn</label>

            <input
              className="input"
              name="lastName"
              value={form.lastName}
              onChange={updateField}
            />
          </div>

          <div className="auth-field">
            <label>Användarnamn</label>

            <input
              className="input"
              name="username"
              value={form.username}
              onChange={updateField}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>

            <input
              className="input"
              type="email"
              name="email"
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
              value={form.password}
              onChange={updateField}
            />
          </div>

          <div className="auth-field">
            <label>Bekräfta lösenord</label>

            <input
              className="input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
            />
          </div>

          <button className="btn btn-orange">
            Skapa konto
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Har du redan ett konto?
            <Link to="/login"> Logga in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

