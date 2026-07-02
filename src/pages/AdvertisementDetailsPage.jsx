import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommentSection from "../components/comments/CommentSection";
import ImageCarousel from "../components/advertisements/ImageCarousel";
import PrintAdvertisement from "../components/advertisements/PrintAdvertisement";
import { advertisementService } from "../services/advertisementService";
import { commentService } from "../services/commentService";
import { advertisementImageService } from "../services/advertisementImageService";
import { reportService } from "../services/reportService";
import { api, resolveBackendAssetUrl } from "../services/api";
import { useAuthStore } from "../store/authStore";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image blob"));
    reader.readAsDataURL(blob);
  });
}

async function waitForImageToLoad(image) {
  if (!image) return;
  if (image.complete && image.naturalWidth > 0) return;

  if (typeof image.decode === "function") {
    try {
      await image.decode();
      if (image.naturalWidth > 0) return;
    } catch {
      // Fall through to load/error events.
    }
  }

  await new Promise((resolve) => {
    const finish = () => resolve();
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

async function setImageSourceAndWait(image, src) {
  if (!image || !src) return;

  if (image.currentSrc === src || image.getAttribute("src") === src) {
    await waitForImageToLoad(image);
    return;
  }

  await new Promise((resolve) => {
    const finish = () => resolve();
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    image.setAttribute("src", src);
  });

  if (typeof image.decode === "function") {
    try {
      await image.decode();
    } catch {
      // Best effort after the load event.
    }
  }
}

function restoreInlineStyle(element, previousStyle) {
  if (!element) return;
  if (previousStyle === null) {
    element.removeAttribute("style");
    return;
  }

  element.setAttribute("style", previousStyle);
}

async function getPrintableImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^(blob:|data:)/i.test(imageUrl)) return imageUrl;

  const absoluteImageUrl = resolveBackendAssetUrl(imageUrl);
  const { data } = await api.get(absoluteImageUrl, { responseType: "blob" });
  return blobToDataUrl(data);
}

export default function AdvertisementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [advertisement, setAdvertisement] = useState(null);
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [printImageUrl, setPrintImageUrl] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pickedUrl, setPickedUrl] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reporting, setReporting] = useState(false);

  const { data: saved = false } = useQuery({
    queryKey: ["savedAdvertisements", user?.accountId],
    queryFn: () => advertisementService.getSaved(user.accountId),
    select: (ads) => ads.some((ad) => ad.advertisementId === Number(id)),
    enabled: !!user?.accountId,
  });

  useEffect(() => {
    async function load() {
      try {
        const ad = await advertisementService.getById(id);
        setAdvertisement(ad);
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
        // Comments are optional for the page.
      }

      try {
        setImages(await advertisementImageService.getByAdvertisement(id));
      } catch {
        // Images are optional for the page.
      }
    }

    load();
  }, [id]);

  async function handleSave() {
    if (!isAuthenticated) return;

    setSaving(true);
    const queryKey = ["savedAdvertisements", user?.accountId];

    queryClient.setQueryData(queryKey, (old = []) =>
      saved
        ? old.filter((ad) => ad.advertisementId !== Number(id))
        : [...old, advertisement]
    );

    try {
      if (saved) {
        await advertisementService.unsave(id);
      } else {
        await advertisementService.save(id);
      }
    } catch (err) {
      queryClient.invalidateQueries({ queryKey });
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

  async function savePdf(selectedImageUrl = null) {
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const printRoot = document.getElementById("print-advertisement");
    const printSheet = printRoot?.querySelector(".print-sheet");
    if (!printRoot || !printSheet) {
      alert("Kunde inte skapa PDF-förhandsvisningen.");
      return;
    }

    const previousRootStyle = printRoot.getAttribute("style");
    const previousSheetStyle = printSheet.getAttribute("style");
    const image = printRoot.querySelector(".print-image");
    const previousImageSrc = image?.getAttribute("src") ?? null;

    Object.assign(printRoot.style, {
      display: "block",
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "794px",
      margin: "0",
      padding: "0",
      background: "#ffffff",
      opacity: "1",
      pointerEvents: "none",
      zIndex: "-1",
    });

    Object.assign(printSheet.style, {
      width: "794px",
      background: "#ffffff",
    });

    try {
      if (image && selectedImageUrl) {
        await setImageSourceAndWait(image, selectedImageUrl);
      }

      await waitForImageToLoad(image);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(printRoot, {
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        logging: false,
        scale: 2,
        useCORS: true,
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
      const renderWidth = canvas.width * scale;
      const renderHeight = canvas.height * scale;
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);

      pdf.addImage(
        imageDataUrl,
        "JPEG",
        (pageWidth - renderWidth) / 2,
        margin,
        renderWidth,
        renderHeight,
        undefined,
        "FAST"
      );
      pdf.save(`${advertisement.title}.pdf`);
    } finally {
      if (image && previousImageSrc) {
        image.setAttribute("src", previousImageSrc);
      } else if (image && !previousImageSrc) {
        image.removeAttribute("src");
      }

      restoreInlineStyle(printSheet, previousSheetStyle);
      restoreInlineStyle(printRoot, previousRootStyle);
    }
  }

  function openModal() {
    if (images.length <= 1) {
      const url = images[0]?.imageUrl ?? null;
      setPrintImageUrl(url);
      setPickedUrl(url);
    } else {
      setPickedUrl(images[0].imageUrl);
    }

    setShowPrintModal(true);
  }

  async function handleModalConfirm(action) {
    const url = pickedUrl ?? images[0]?.imageUrl ?? null;
    let printableImageUrl = url;

    if (url) {
      try {
        printableImageUrl = await getPrintableImageUrl(url);
      } catch {
        printableImageUrl = resolveBackendAssetUrl(url);
      }
    }

    setPrintImageUrl(printableImageUrl);
    setShowPrintModal(false);

    if (action === "save") {
      requestAnimationFrame(() => requestAnimationFrame(() => savePdf(printableImageUrl)));
      return;
    }

    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
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
      setComments((current) => current.filter((comment) => comment.commentId !== commentId));
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
    Svart: { bg: "#374151", border: "#1f2937", color: "#f9fafb" },
    Vit: { bg: "#f9fafb", border: "#e5e7eb", color: "#374151" },
    Grå: { bg: "#e5e7eb", border: "#9ca3af", color: "#374151" },
    Orange: { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
    Brun: { bg: "#fef0d0", border: "#e8c97a", color: "#7c3a00" },
    Beige: { bg: "#fefce8", border: "#fde68a", color: "#854d0e" },
    Rödbrun: { bg: "#fef2e4", border: "#fca882", color: "#9a3412" },
    Blågrå: { bg: "#f0f4f8", border: "#cbd5e1", color: "#334155" },
    Calico: { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
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
            <p style={{ margin: 0 }}>{advertisement.cat?.name ?? "-"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.cat?.breed ?? "Okänd ras"}</p>
            <p style={{ margin: 0, color: "#6b7280" }}>{advertisement.cat?.furColor ?? "Okänd färg"}</p>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <p style={{ margin: 0, color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Plats</p>
            <p style={{ margin: 0 }}>{advertisement.location?.city ?? "-"}</p>
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
            onClick={openModal}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              color: "#6b7280",
              borderRadius: 999,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.15s ease",
            }}
          >
            Skriv ut / Spara PDF
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
                borderRadius: 999,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
              }}
            >
              {saved ? "Sparad" : "Spara annons"}
            </button>
          )}
          {isAuthenticated && user?.accountId !== advertisement.accountId && (
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: "none",
                border: "1px solid #fca5a5",
                color: "#ef4444",
                borderRadius: 999,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
              }}
            >
              Rapportera
            </button>
          )}
          {user?.accountId === advertisement.accountId && (
            <button
              onClick={handleDelete}
              style={{
                background: "none",
                border: "1px solid #fca5a5",
                color: "#ef4444",
                borderRadius: 999,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
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
        selectedImageUrl={printImageUrl ?? pickedUrl}
      />

      {showPrintModal && (
        <div
          onClick={() => setShowPrintModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 24,
              padding: 28,
              width: "min(560px, 92vw)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Välj bild</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
                overflowY: "auto",
              }}
            >
              {images.map((img) => (
                <img
                  key={img.imageUrl}
                  src={resolveBackendAssetUrl(img.imageUrl)}
                  alt=""
                  onClick={() => setPickedUrl(img.imageUrl)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 12,
                    cursor: "pointer",
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
                  background: "none",
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                  borderRadius: 999,
                  padding: "9px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Avbryt
              </button>
              <button
                onClick={() => handleModalConfirm("print")}
                style={{
                  background: "none",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                  borderRadius: 999,
                  padding: "9px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Skriv ut
              </button>
              <button
                onClick={() => handleModalConfirm("save")}
                style={{
                  background: "#f97316",
                  border: "none",
                  color: "white",
                  borderRadius: 999,
                  padding: "9px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Spara PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 24,
              padding: 28,
              width: "min(480px, 92vw)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Rapportera annons</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
              Beskriv varför du rapporterar den här annonsen. Administratörerna granskar alla rapporter.
            </p>
            <textarea
              value={reportComment}
              onChange={(event) => setReportComment(event.target.value)}
              placeholder="T.ex. spam, felaktig information, olämpligt innehåll..."
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportComment("");
                }}
                style={{
                  background: "none",
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                  borderRadius: 999,
                  padding: "9px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Avbryt
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                style={{
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  borderRadius: 999,
                  padding: "9px 20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  opacity: reporting ? 0.6 : 1,
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
