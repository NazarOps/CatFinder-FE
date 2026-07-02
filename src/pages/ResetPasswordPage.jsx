import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    code: searchParams.get("code") || "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      alert("Lösenordet är uppdaterat. Du kan nu logga in.");
      navigate("/login");
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : error.response?.data?.title || error.message || "Okänt fel";
      alert("Kunde inte återställa lösenord:\n" + message);
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

    if (form.newPassword !== form.confirmPassword) {
      alert("Lösenorden matchar inte.");
      return;
    }

    resetPasswordMutation.mutate({
      email: form.email,
      code: form.code,
      newPassword: form.newPassword,
    });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">CatFinder</p>
          <h1>Återställ lösenord</h1>
          <p>
            Välj ett nytt lösenord för ditt CatFinder-konto.
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
              required
            />
          </div>

          <div className="auth-field">
            <label>Återställningskod</label>
            <input
              className="input"
              name="code"
              value={form.code}
              onChange={updateField}
              required
            />
          </div>

          <div className="auth-field">
            <label>Nytt lösenord</label>
            <input
              className="input"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={updateField}
              required
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
              required
            />
          </div>

          <button
            className="btn btn-orange"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Sparar..."
              : "Återställ lösenord"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vill du pröva igen?
            <Link to="/forgotpassword"> Skicka ny länk</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
