import { useState } from "react";

export default function ImageCarousel({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#f3f4f6" }}>
      <img
        src={images[active].imageUrl}
        alt=""
        style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
            style={{
              position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)",
              width: 38, height: 38, borderRadius: "50%", border: "none",
              background: "rgba(0,0,0,0.4)", color: "white", cursor: "pointer",
              fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
          <button
            onClick={() => setActive(i => (i + 1) % images.length)}
            style={{
              position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)",
              width: 38, height: 38, borderRadius: "50%", border: "none",
              background: "rgba(0,0,0,0.4)", color: "white", cursor: "pointer",
              fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>

          <div style={{
            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  background: i === active ? "white" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.2s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
