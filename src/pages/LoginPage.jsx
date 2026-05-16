import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

// LoginPage - inloggningsformulär
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth({
        token: data.token,
        user: data.user,
      });
      navigate("/advertisements");
    },
    onError: () => {
      alert("Fel email eller lösenord.");
    },
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loginMutation.mutate(form);
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

          <button
            className="btn btn-orange"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Loggar in..." : "Logga in"}
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