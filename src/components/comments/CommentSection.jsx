import { useState } from "react";

// CommentSection - visa och låt användare skriva kommentarer på annonser
export default function CommentSection({ comments = [], onSubmit }) {
  const [body, setBody] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    await onSubmit({ body });
    setBody("");
  }

  return (
    <section className="card">
      <h2>Kommentarer</h2>
      <form onSubmit={handleSubmit} className="form">
        <textarea
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Skriv en kommentar..."
        />
        <button className="btn">Skicka kommentar</button>
      </form>
      <div className="grid" style={{ marginTop: 20 }}>
        {comments.length === 0 && <p>Inga kommentarer ännu.</p>}
        {comments.map((c) => (
          <div
            key={c.commentId}
            style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}
          >
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
