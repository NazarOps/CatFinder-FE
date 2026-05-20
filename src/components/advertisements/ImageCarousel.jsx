import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ImageCarousel({ images }) {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowLeft") setActive(i => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setActive(i => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, images.length]);

  if (!images || images.length === 0) return null;

  const modal = modalOpen && createPortal(
    <div
      onClick={() => setModalOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <img
        src={images[active].imageUrl}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "contain",
          display: "block",
        }}
      />

      {/* Close */}
      <button
        onClick={() => setModalOpen(false)}
        style={{
          position: "fixed", top: 16, right: 16,
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.2)", color: "white", cursor: "pointer",
          fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >✕</button>

      {/* Counter */}
      {images.length > 1 && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.7)", fontSize: "0.85rem",
          background: "rgba(0,0,0,0.4)", padding: "4px 12px", borderRadius: 999,
        }}>
          {active + 1} / {images.length}
        </div>
      )}

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setActive(i => (i - 1 + images.length) % images.length); }}
            style={{
              position: "fixed", top: "50%", left: 16, transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer",
              fontSize: "1.6rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
          <button
            onClick={(e) => { e.stopPropagation(); setActive(i => (i + 1) % images.length); }}
            style={{
              position: "fixed", top: "50%", right: 16, transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer",
              fontSize: "1.6rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>
        </>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#f3f4f6" }}>
        <img
          src={images[active].imageUrl}
          alt=""
          onClick={() => setModalOpen(true)}
          style={{ width: "100%", height: 420, objectFit: "cover", display: "block", cursor: "zoom-in" }}
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

      {modal}
    </>
  );
}
