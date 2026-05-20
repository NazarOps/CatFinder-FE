import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

export default function CommentSection({ comments = [], onSubmit }) {
  const user = useAuthStore((state) => state.user);
  const [body, setBody] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    await onSubmit({ body });
    setBody("");
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
          <div
            key={c.commentId}
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "12px 16px",
              display: "grid",
              gap: 6,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f97316" }}>
              {c.username ?? c.account?.username ?? c.account?.accountName ?? c.user?.username ?? c.authorName ?? c.accountUsername ?? c.accountName ?? c.name ?? "Användare"}
            </span>
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.5 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
