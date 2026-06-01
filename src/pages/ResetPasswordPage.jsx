import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

// ResetPasswordPage - form for setting a new password from a reset link
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      alert("Losenordet ar uppdaterat. Du kan nu logga in.");
      navigate("/login");
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : error.response?.data?.title || error.message || "Okant fel";
      alert("Kunde inte aterstalla losenord:\n" + message);
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
      alert("Losenorden matchar inte.");
      return;
    }

    resetPasswordMutation.mutate({
      email: form.email,
      code: form.code,
      newPassword: form.newPassword
    });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">CatFinder</p>
          <h1>Aterstall losenord</h1>
          <p>
            Valj ett nytt losenord for ditt CatFinder-konto.
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
            <label>Nytt losenord</label>
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
            <label>Bekrafta losenord</label>
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
              : "Aterstall losenord"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vill du prova igen?
            <Link to="/forgotpassword"> Skicka ny lank</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
