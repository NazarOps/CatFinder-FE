import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";

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

export default function PrintAdvertisement({ advertisement, images, advertisementUrl, selectedImageUrl }) {
  const furColor = advertisement.cat?.furColor;
  const theme = furThemes[furColor] ?? { bg: "#f5ede4", border: "#dcc5b0", color: "#5c3622" };
  const firstImage = selectedImageUrl ?? images?.[0]?.imageUrl;

  return createPortal(
    <div id="print-advertisement" aria-hidden="true">
      <div className="print-sheet">

        {/* Header */}
        <div className="print-header" style={{ background: theme.bg, borderBottom: `2px solid ${theme.border}`, color: theme.color }}>
          <div>
            <div className="print-site-name">CatFinder</div>
            <h1 className="print-title">{advertisement.title}</h1>
          </div>
        </div>

        {/* Body */}
        <div className="print-body">

          {/* Image */}
          {firstImage && (
            <img
              src={firstImage}
              alt=""
              className="print-image"
            />
          )}

          {/* Description */}
          {advertisement.description && (
            <p className="print-description">{advertisement.description}</p>
          )}

          {/* Info grid */}
          <div className="print-info-grid">
            <div className="print-info-block">
              <div className="print-info-label">Katt</div>
              <div className="print-info-value">{advertisement.cat?.name ?? "—"}</div>
              <div className="print-info-sub">{advertisement.cat?.breed ?? "Okänd ras"}</div>
              <div className="print-info-sub">{advertisement.cat?.furColor ?? "Okänd färg"}</div>
            </div>
            <div className="print-info-block">
              <div className="print-info-label">Plats</div>
              <div className="print-info-value">{advertisement.location?.city ?? "—"}</div>
              <div className="print-info-sub">{advertisement.location?.area ?? ""}</div>
            </div>
            <div className="print-info-block">
              <div className="print-info-label">Kontakt</div>
              <div className="print-info-value">{advertisement.contactPhoneNumber ?? "Ej angivet"}</div>
              <div className="print-info-sub">{advertisement.contactEmail ?? "Ej angivet"}</div>
            </div>
          </div>

          {/* QR footer */}
          <div className="print-qr-footer">
            <QRCodeSVG value={advertisementUrl} size={120} />
            <div className="print-qr-label">
              <div className="print-qr-label-title">Scanna för att se annonsen online</div>
              <div className="print-qr-url">{advertisementUrl}</div>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
