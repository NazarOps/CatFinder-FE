import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

// ForgotPasswordPage - form for requesting a password reset email
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      alert("Om kontot finns skickas en aterstallningslank till din email.");
      setEmail("");
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : error.response?.data?.title || error.message || "Okant fel";
      alert("Kunde inte skicka aterstallningslank:\n" + message);
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    forgotPasswordMutation.mutate(email);
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">CatFinder</p>
          <h1>Glomt losenord</h1>
          <p>
            Ange din email sa skickar vi en lank for att aterstalla ditt
            losenord.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-orange"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending
              ? "Skickar..."
              : "Skicka aterstallningslank"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Kom du pa losenordet?
            <Link to="/login"> Logga in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
