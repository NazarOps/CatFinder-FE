import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentSection from "../components/comments/CommentSection";
import ImageCarousel from "../components/advertisements/ImageCarousel";
import { advertisementService } from "../services/advertisementService";
import { commentService } from "../services/commentService";
import { advertisementImageService } from "../services/advertisementImageService";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";

// AdvertisementDetailsPage - visar detaljer om en annons med kommentarer
export default function AdvertisementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [advertisement, setAdvertisement] = useState(null);
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const ad = await advertisementService.getById(id);
        setAdvertisement(ad);
        setSaved(ad.isSaved ?? false);
      } catch (err) {
        const errors = err.response?.data?.errors;
        const message = Array.isArray(errors) && errors.length > 0
          ? errors.join("\n")
          : err.response?.data?.title || err.message || "Okänt fel";
        setError(message);
        return;
      }

      try {
        setComments(await commentService.getByAdvertisement(id));
      } catch {
        // kommentarer är inte kritiska — visa annonsen ändå
      }

      try {
        setImages(await advertisementImageService.getByAdvertisement(id));
      } catch {
        // bilder är inte kritiska — visa annonsen ändå
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!isAuthenticated) return;
    setSaving(true);
    try {
      if (saved) {
        await advertisementService.unsave(id);
        setSaved(false);
      } else {
        await advertisementService.save(id);
        setSaved(true);
      }
      queryClient.invalidateQueries({ queryKey: ["savedAdvertisements"] });
    } catch (err) {
      alert("Kunde inte spara annonsen: " + (err.response?.data?.title || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Är du säker på att du vill ta bort annonsen?")) return;
    try {
      await advertisementService.delete(id);
      navigate("/advertisements");
    } catch (err) {
      alert("Kunde inte ta bort annonsen: " + (err.response?.data?.title || err.message));
    }
  }

  async function handleCreateComment(payload) {
    if (!isAuthenticated) {
      alert("Du måste logga in för att kommentera.");
      return;
    }
    try {
      const created = await commentService.create(id, payload);
      setComments((current) => [
        ...current,
        { username: user?.username ?? user?.email, ...created },
      ]);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : err.response?.data?.title || err.message || "Okänt fel";
      alert("Kunde inte skicka kommentar:\n" + message);
    }
  }

  if (error) {
    return <section className="page">Kunde inte ladda annonsen: {error}</section>;
  }

  if (!advertisement) {
    return <section className="page">Laddar...</section>;
  }

  const furThemes = {
    "Svart":   { bg: "#374151", border: "#1f2937", color: "#f9fafb" },
    "Vit":     { bg: "#f9fafb", border: "#e5e7eb", color: "#374151" },
    "Grå":     { bg: "#e5e7eb", border: "#9ca3af", color: "#374151" },
    "Orange":  { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
    "Brun":    { bg: "#fef0d0", border: "#e8c97a", color: "#7c3a00" },
    "Beige":   { bg: "#fefce8", border: "#fde68a", color: "#854d0e" },
    "Rödbrun": { bg: "#fef2e4", border: "#fca882", color: "#9a3412" },
    "Blågrå":  { bg: "#f0f4f8", border: "#cbd5e1", color: "#334155" },
    "Calico":  { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
  };
  const furColor = advertisement.cat?.furColor;
  const theme = furThemes[furColor] ?? { bg: "#f5ede4", border: "#dcc5b0", color: "#5c3622" };

  const cardHeader = {
    margin: "-24px -24px 18px -24px",
    background: theme.bg,
    borderBottom: `1px solid ${theme.border}`,
    borderRadius: "23px 23px 0 0",
    padding: "16px 24px",
    fontSize: "1rem",
    fontWeight: 700,
    color: theme.color,
  };

  return (
    <section className="page" style={{ display: "grid", gap: 24, maxWidth: 800 }}>

      <ImageCarousel images={images} />

      <article className="card" style={{ display: "grid", gap: 14 }}>
        <h2 style={cardHeader}>{advertisement.title}</h2>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>{advertisement.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <p style={{ margin: 0, color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Katt</p>
            <p style={{ margin: 0 }}>{advertisement.cat?.name ?? "—"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.cat?.breed ?? "Okänd ras"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.cat?.furColor ?? "Okänd färg"}</p>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <p style={{ margin: 0, color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Plats</p>
            <p style={{ margin: 0 }}>{advertisement.location?.city ?? "—"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.location?.area ?? ""}</p>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <p style={{ margin: 0, color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Kontakt</p>
            <p style={{ margin: 0 }}>{advertisement.contactPhoneNumber ?? "Ej angivet"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.contactEmail ?? "Ej angivet"}</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          {isAuthenticated && user?.accountId !== advertisement.accountId && (
            <button
              onClick={handleSave}
              disabled={saving}
              title={saved ? "Ta bort från sparade" : "Spara annons"}
              style={{
                background: saved ? "#fff7ed" : "none",
                border: `1px solid ${saved ? "#fed7aa" : "#e5e7eb"}`,
                color: saved ? "#f97316" : "#9ca3af",
                borderRadius: 999, padding: "8px 18px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.875rem",
                transition: "all 0.15s ease",
              }}
            >
              {saved ? "♥ Sparad" : "♡ Spara annons"}
            </button>
          )}
          {user?.accountId === advertisement.accountId && (
            <button
              onClick={handleDelete}
              style={{
                background: "none", border: "1px solid #fca5a5", color: "#ef4444",
                borderRadius: 999, padding: "8px 18px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.875rem",
              }}
            >
              Ta bort annons
            </button>
          )}
        </div>
      </article>

      <CommentSection comments={comments} onSubmit={handleCreateComment} />

    </section>
  );
}
