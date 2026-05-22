import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CommentSection from "../components/comments/CommentSection";
import ImageCarousel from "../components/advertisements/ImageCarousel";
import PrintAdvertisement from "../components/advertisements/PrintAdvertisement";
import { advertisementService } from "../services/advertisementService";
import { commentService } from "../services/commentService";
import { advertisementImageService } from "../services/advertisementImageService";
import { reportService } from "../services/reportService";
import { api } from "../services/api";
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
  const [printImageUrl, setPrintImageUrl] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pickedUrl, setPickedUrl] = useState(null);
  const [pendingAction, setPendingAction] = useState("print"); // "print" | "save"
  const [imageBlobUrls, setImageBlobUrls] = useState({}); // imageUrl → blob: URL
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reporting, setReporting] = useState(false);

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
        const fetchedImages = await advertisementImageService.getByAdvertisement(id);
        setImages(fetchedImages);
        // Pre-fetch each image as a blob using the authenticated client.
        // blob: URLs are same-origin, so canvas.toDataURL() works without CORS issues.
        const blobUrls = {};
        await Promise.all(fetchedImages.map(async (img) => {
          try {
            const { data } = await api.get(img.imageUrl, { responseType: "blob" });
            blobUrls[img.imageUrl] = URL.createObjectURL(data);
          } catch { /* image pre-fetch failed, will be skipped in PDF */ }
        }));
        setImageBlobUrls(blobUrls);
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

  const FUR_THEMES = {
    "Svart":   { bg: "#374151", color: "#f9fafb" },
    "Vit":     { bg: "#f9fafb", color: "#374151" },
    "Grå":     { bg: "#e5e7eb", color: "#374151" },
    "Orange":  { bg: "#fff7ed", color: "#c2410c" },
    "Brun":    { bg: "#fef0d0", color: "#7c3a00" },
    "Beige":   { bg: "#fefce8", color: "#854d0e" },
    "Rödbrun": { bg: "#fef2e4", color: "#9a3412" },
    "Blågrå":  { bg: "#f0f4f8", color: "#334155" },
    "Calico":  { bg: "#fff7ed", color: "#c2410c" },
  };

  async function savePdf(selectedImg) {
    const [{ jsPDF }, QRCode] = await Promise.all([
      import("jspdf"),
      import("qrcode"),
    ]);

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const W = 210, margin = 18, contentW = 210 - 36;
    const hex = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    let y = 0;

    // Header bar
    const theme = FUR_THEMES[advertisement.cat?.furColor] ?? { bg: "#f5ede4", color: "#5c3622" };
    const [bgR,bgG,bgB] = hex(theme.bg);
    const [fgR,fgG,fgB] = hex(theme.color);
    pdf.setFillColor(bgR,bgG,bgB);
    pdf.rect(0, 0, W, 34, "F");
    pdf.setTextColor(fgR,fgG,fgB);
    pdf.setFontSize(7); pdf.setFont("helvetica","bold");
    pdf.text("CATFINDER", margin, 11);
    pdf.setFontSize(20);
    pdf.text(advertisement.title, margin, 26, { maxWidth: contentW });
    y = 42;

    // Photo — use pre-fetched blob: URL (same-origin, no canvas taint)
    if (selectedImg) {
      const blobUrl = imageBlobUrls[selectedImg];
      if (blobUrl) {
        const dataUrl = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
          };
          img.onerror = () => resolve(null);
          img.src = blobUrl;
        });
        if (dataUrl) {
          pdf.addImage(dataUrl, "JPEG", margin, y, contentW, 72);
          y += 78;
        }
      }
    }

    // Description
    if (advertisement.description) {
      pdf.setTextColor(51,51,51); pdf.setFontSize(10); pdf.setFont("helvetica","normal");
      const lines = pdf.splitTextToSize(advertisement.description, contentW);
      pdf.text(lines, margin, y);
      y += lines.length * 5.5 + 8;
    }

    // Divider
    pdf.setDrawColor(229,231,235); pdf.line(margin, y, W-margin, y); y += 7;

    // Info columns
    const cols = [
      { label: "KATT",    rows: [advertisement.cat?.name ?? "—", advertisement.cat?.breed ?? "Okänd ras", advertisement.cat?.furColor ?? ""] },
      { label: "PLATS",   rows: [advertisement.location?.city ?? "—", advertisement.location?.area ?? ""] },
      { label: "KONTAKT", rows: [advertisement.contactPhoneNumber ?? "Ej angivet", advertisement.contactEmail ?? "Ej angivet"] },
    ];
    const colW = contentW / 3;
    cols.forEach(({ label, rows }, i) => {
      const x = margin + i * colW;
      pdf.setTextColor(156,163,175); pdf.setFontSize(7); pdf.setFont("helvetica","bold");
      pdf.text(label, x, y);
      pdf.setTextColor(17,24,39); pdf.setFontSize(10); pdf.setFont("helvetica","bold");
      pdf.text(rows[0], x, y+6);
      pdf.setFont("helvetica","normal"); pdf.setTextColor(107,114,128); pdf.setFontSize(9);
      rows.slice(1).forEach((row, j) => { if (row) pdf.text(row, x, y+12+j*5); });
    });
    y += 30;

    // Divider
    pdf.setDrawColor(229,231,235); pdf.line(margin, y, W-margin, y); y += 8;

    // QR code + URL
    const qrDataUrl = await QRCode.toDataURL(window.location.href, { margin: 1 });
    pdf.addImage(qrDataUrl, "PNG", margin, y, 28, 28);
    pdf.setTextColor(17,24,39); pdf.setFontSize(9); pdf.setFont("helvetica","bold");
    pdf.text("Scanna för att se annonsen online", margin+32, y+8);
    pdf.setFont("helvetica","normal"); pdf.setTextColor(107,114,128); pdf.setFontSize(8);
    pdf.text(window.location.href, margin+32, y+15, { maxWidth: contentW-32 });

    pdf.save(`${advertisement.title}.pdf`);
  }

  function openModal(action) {
    setPendingAction(action);
    if (images.length <= 1) {
      const url = images[0]?.imageUrl ?? null;
      setPrintImageUrl(url);
      if (action === "save") {
        savePdf(url);
      } else {
        requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
      }
      return;
    }
    setPickedUrl(images[0].imageUrl);
    setShowPrintModal(true);
  }

  function handleModalConfirm() {
    const url = pickedUrl;
    setPrintImageUrl(url);
    setShowPrintModal(false);
    if (pendingAction === "save") {
      savePdf(url);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    }
  }

  async function handleReport() {
    if (reportComment.trim().length < 5) {
      alert("Beskriv problemet med minst 5 tecken.");
      return;
    }
    setReporting(true);
    try {
      await reportService.create(id, reportComment.trim());
      setShowReportModal(false);
      setReportComment("");
      alert("Tack! Din rapport har skickats till administratörerna.");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors) && errors.length > 0
        ? errors.join("\n")
        : err.response?.data?.title || err.message || "Okänt fel";
      alert("Kunde inte skicka rapport:\n" + message);
    } finally {
      setReporting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Är du säker på att du vill ta bort kommentaren?")) return;
    try {
      await commentService.delete(commentId);
      setComments((current) => current.filter((c) => c.commentId !== commentId));
    } catch (err) {
      alert("Kunde inte ta bort kommentaren: " + (err.response?.data?.title || err.message));
    }
  }

  async function handleReportComment(commentId, comment) {
    await reportService.createCommentReport(id, commentId, comment);
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
        { 
          ...created,
          username: user?.username ?? user?.email,
        },
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
          <button
            onClick={() => openModal("save")}
            style={{
              background: "none", border: "1px solid #e5e7eb", color: "#6b7280",
              borderRadius: 999, padding: "8px 18px", cursor: "pointer",
              fontWeight: 600, fontSize: "0.875rem", transition: "all 0.15s ease",
            }}
          >
            Spara PDF
          </button>
          <button
            onClick={() => openModal("print")}
            style={{
              background: "none", border: "1px solid #e5e7eb", color: "#6b7280",
              borderRadius: 999, padding: "8px 18px", cursor: "pointer",
              fontWeight: 600, fontSize: "0.875rem", transition: "all 0.15s ease",
            }}
          >
            Skriv ut
          </button>
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
          {isAuthenticated && user?.accountId !== advertisement.accountId && (
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: "none", border: "1px solid #fca5a5", color: "#ef4444",
                borderRadius: 999, padding: "8px 18px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.875rem", transition: "all 0.15s ease",
              }}
            >
              Rapportera
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

      <CommentSection
        comments={comments}
        onSubmit={handleCreateComment}
        onDelete={handleDeleteComment}
        onReport={handleReportComment}
      />

      <PrintAdvertisement
        advertisement={advertisement}
        images={images}
        advertisementUrl={window.location.href}
        selectedImageUrl={printImageUrl}
      />

      {showPrintModal && (
        <div
          onClick={() => setShowPrintModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9997,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 24, padding: 28,
              width: "min(560px, 92vw)", maxHeight: "80vh",
              display: "flex", flexDirection: "column", gap: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Välj bild för utskrift</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
              overflowY: "auto",
            }}>
              {images.map((img) => (
                <img
                  key={img.imageUrl}
                  src={img.imageUrl}
                  alt=""
                  onClick={() => setPickedUrl(img.imageUrl)}
                  style={{
                    width: "100%", aspectRatio: "1", objectFit: "cover",
                    borderRadius: 12, cursor: "pointer",
                    border: pickedUrl === img.imageUrl
                      ? "3px solid #f97316"
                      : "3px solid transparent",
                    outline: pickedUrl === img.imageUrl
                      ? "2px solid #fed7aa"
                      : "none",
                    transition: "border 0.15s ease",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowPrintModal(false)}
                style={{
                  background: "none", border: "1px solid #e5e7eb", color: "#6b7280",
                  borderRadius: 999, padding: "9px 20px", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                }}
              >
                Avbryt
              </button>
              <button
                onClick={handleModalConfirm}
                style={{
                  background: "#f97316", border: "none", color: "white",
                  borderRadius: 999, padding: "9px 20px", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                }}
              >
                {pendingAction === "save" ? "Spara PDF" : "Skriv ut"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9997,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 24, padding: 28,
              width: "min(480px, 92vw)",
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Rapportera annons</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
              Beskriv varför du rapporterar den här annonsen. Administratörerna granskar alla rapporter.
            </p>
            <textarea
              value={reportComment}
              onChange={(e) => setReportComment(e.target.value)}
              placeholder="T.ex. spam, felaktig information, olämpligt innehåll..."
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1px solid #e5e7eb", borderRadius: 12,
                padding: "10px 14px", fontSize: "0.9rem",
                fontFamily: "inherit", resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => { setShowReportModal(false); setReportComment(""); }}
                style={{
                  background: "none", border: "1px solid #e5e7eb", color: "#6b7280",
                  borderRadius: 999, padding: "9px 20px", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                }}
              >
                Avbryt
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                style={{
                  background: "#ef4444", border: "none", color: "white",
                  borderRadius: 999, padding: "9px 20px", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.875rem", opacity: reporting ? 0.6 : 1,
                }}
              >
                {reporting ? "Skickar..." : "Skicka rapport"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
