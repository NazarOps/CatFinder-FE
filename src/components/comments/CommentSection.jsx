import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

export default function CommentSection({ comments = [], onSubmit, onDelete, onReport }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "Admin";
  const [body, setBody] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [reportText, setReportText] = useState("");
  const [reportSending, setReportSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    await onSubmit({ body });
    setBody("");
  }

  async function handleSendReport() {
    if (reportText.trim().length < 5) {
      alert("Beskriv problemet med minst 5 tecken.");
      return;
    }
    setReportSending(true);
    try {
      await onReport(reportingCommentId, reportText.trim());
      setReportingCommentId(null);
      setReportText("");
      alert("Tack! Din rapport har skickats till administratörerna.");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : err.response?.data?.title || err.message || "Okänt fel";
      alert("Kunde inte skicka rapport:\n" + message);
    } finally {
      setReportSending(false);
    }
  }

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Kommentarer</h2>

      <form onSubmit={handleSubmit} className="form">
        {user && (
          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#374151", fontSize: "0.9rem" }}>
            Kommenterar som <span style={{ color: "#f97316" }}>{user.username ?? user.email}</span>
          </p>
        )}
        <textarea
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Skriv en kommentar..."
        />
        <button className="btn">Skicka kommentar</button>
      </form>

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {comments.length === 0 && (
          <p style={{ color: "#9ca3af", margin: 0 }}>Inga kommentarer ännu.</p>
        )}
        {comments.map((c) => (
          <div key={c.commentId}>
            <div
              style={{
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "12px 16px",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f97316" }}>
                  {c.username ?? c.account?.username ?? "Användare"}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {user && user.accountId !== c.accountId && onReport && (
                    <button
                      onClick={() => {
                        setReportingCommentId(c.commentId);
                        setReportText("");
                      }}
                      style={{
                        background: "none", border: "none", color: "#9ca3af",
                        fontSize: "0.75rem", cursor: "pointer", padding: "2px 6px",
                        borderRadius: 6, fontWeight: 600,
                      }}
                    >
                      Rapportera
                    </button>
                  )}
                  {isAdmin && onDelete && (
                    <button
                      onClick={() => onDelete(c.commentId)}
                      style={{
                        background: "none", border: "none", color: "#ef4444",
                        fontSize: "0.75rem", cursor: "pointer", padding: "2px 6px",
                        borderRadius: 6, fontWeight: 600,
                      }}
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              </div>
              <p style={{ margin: 0, color: "#374151", lineHeight: 1.5 }}>{c.body}</p>
            </div>

            {reportingCommentId === c.commentId && (
              <div style={{
                background: "#fff8f8", border: "1px solid #fecaca",
                borderRadius: "0 0 14px 14px", padding: "12px 16px",
                display: "grid", gap: 8,
              }}>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#b91c1c", fontWeight: 600 }}>
                  Rapportera kommentar
                </p>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Beskriv varför du rapporterar..."
                  rows={2}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1px solid #fca5a5", borderRadius: 8,
                    padding: "8px 10px", fontSize: "0.85rem",
                    fontFamily: "inherit", resize: "vertical", outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setReportingCommentId(null)}
                    style={{
                      background: "none", border: "1px solid #e5e7eb", color: "#6b7280",
                      borderRadius: 999, padding: "5px 14px", cursor: "pointer",
                      fontWeight: 600, fontSize: "0.8rem",
                    }}
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleSendReport}
                    disabled={reportSending}
                    style={{
                      background: "#ef4444", border: "none", color: "white",
                      borderRadius: 999, padding: "5px 14px", cursor: "pointer",
                      fontWeight: 600, fontSize: "0.8rem", opacity: reportSending ? 0.6 : 1,
                    }}
                  >
                    {reportSending ? "Skickar..." : "Skicka"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
