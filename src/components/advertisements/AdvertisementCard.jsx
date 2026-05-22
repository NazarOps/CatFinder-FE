import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { advertisementService } from "../../services/advertisementService";
import { advertisementImageService } from "../../services/advertisementImageService";

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

const typeStyle = {
  0: { bg: "#fef2f2", color: "#b91c1c", label: "😿 Försvunnen" },
  1: { bg: "#f0fdf4", color: "#15803d", label: "🐱 Hittad" },
};

export default function AdvertisementCard({ advertisement, isSaved = false }) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { data: fetchedImages = [] } = useQuery({
    queryKey: ["advertisementImages", advertisement.advertisementId],
    queryFn: () => advertisementImageService.getByAdvertisement(advertisement.advertisementId),
    enabled: hovered && !advertisement.primaryImageUrl,
  });

  const previewImage = advertisement.primaryImageUrl ?? fetchedImages[0]?.imageUrl;

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const theme = furThemes[advertisement.cat?.furColor] ?? { bg: "#f5ede4", border: "#dcc5b0", color: "#5c3622" };
  const type = typeStyle[advertisement.type] ?? typeStyle[0];
  const isOwner = user?.accountId === advertisement.accountId;

  async function handleDelete() {
    if (!confirm("Är du säker på att du vill ta bort annonsen?")) return;
    try {
      await advertisementService.delete(advertisement.advertisementId);
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    } catch (err) {
      alert("Kunde inte ta bort annonsen: " + (err.response?.data?.title || err.message));
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      if (saved) {
        await advertisementService.unsave(advertisement.advertisementId);
        setSaved(false);
      } else {
        await advertisementService.save(advertisement.advertisementId);
        setSaved(true);
      }
      queryClient.invalidateQueries({ queryKey: ["savedAdvertisements"] });
    } catch (err) {
      alert("Kunde inte spara annonsen: " + (err.response?.data?.title || err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      className="card"
      style={{ display: "grid", gap: 12, padding: 0, overflow: "hidden", position: "relative", zIndex: hovered ? 2 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        maxHeight: hovered && previewImage ? 180 : 0,
        opacity: hovered && previewImage ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease, opacity 0.25s ease",
      }}>
        {previewImage && (
          <img
            src={previewImage}
            alt={advertisement.title}
            style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      <div style={{
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
        borderRadius: "24px 24px 0 0",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h3 style={{ margin: 0, fontSize: "1.05rem", color: theme.color }}>{advertisement.title}</h3>
        <span style={{
          background: type.bg,
          color: type.color,
          fontSize: "0.78rem",
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}>{type.label}</span>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {advertisement.primaryImageUrl && (
            <img
              src={advertisement.primaryImageUrl}
              alt=""
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid #e5e7eb" }}
            />
          )}
          <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {advertisement.description?.length > 100
              ? advertisement.description.slice(0, 100) + "…"
              : advertisement.description}
          </p>
        </div>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600 }}>
          📍 {advertisement.location?.city ?? "Okänd plats"}{advertisement.location?.area ? `, ${advertisement.location.area}` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
          <Link
            className="btn btn-orange"
            style={{ padding: "8px 18px", fontSize: "0.875rem" }}
            to={`/advertisements/${advertisement.advertisementId}`}
          >
            Visa annons
          </Link>
          {user && !isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              title={saved ? "Ta bort från sparade" : "Spara annons"}
              style={{
                background: saved ? "#fff7ed" : "none",
                border: `1px solid ${saved ? "#fed7aa" : "#e5e7eb"}`,
                color: saved ? "#f97316" : "#9ca3af",
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1,
                transition: "all 0.15s ease",
              }}
            >
              {saved ? "♥" : "♡"}
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              style={{
                background: "none", border: "1px solid #fca5a5", color: "#ef4444",
                borderRadius: 999, padding: "8px 14px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.875rem",
              }}
            >
              Ta bort
            </button>
          )}
        </div>
      </div>

    </article>
  );
}
