import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { advertisementImageService } from "../services/advertisementImageService";
import { resolveBackendAssetUrl } from "../services/api";

const FILTERS = [
  { key: "INKOMMANDE", label: "Inkommande" },
  { key: "ALLA", label: "Alla" },
  { key: "GODKANDA", label: "Godkända" },
  { key: "AVVISADE", label: "Avvisade" },
  { key: "STANGDA", label: "Stängda" },
  { key: "RAPPORTERADE", label: "Rapporterade" },
];

const MODERATION_STATUS = {
  APPROVED: 0,
  PENDING: 1,
  REJECTED: 2,
};

const ADVERTISEMENT_STATUS = {
  ACTIVE: 0,
  RESOLVED: 1,
  CLOSED: 2,
};

export default function AdminPortalPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("INKOMMANDE");
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [previewAd, setPreviewAd] = useState(null);

  const { data: ads = [], isLoading, isError } = useQuery({
    queryKey: ["admin-advertisements"],
    queryFn: adminService.getAllAdvertisements,
  });

  const { data: previewImages = [] } = useQuery({
    queryKey: ["admin-advertisement-images", previewAd?.advertisementId],
    queryFn: () => advertisementImageService.getByAdvertisement(previewAd.advertisementId),
    enabled: !!previewAd?.advertisementId,
  });

  const moderationMutation = useMutation({
    mutationFn: ({ id, moderationStatus }) =>
      adminService.updateModerationStatus(id, moderationStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] }),
    onError: () => alert("Kunde inte uppdatera granskningen."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateAdvertisementStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] }),
    onError: () => alert("Kunde inte stänga annonsen."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteAdvertisement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] }),
    onError: () => alert("Kunde inte ta bort annonsen."),
  });

  function handleModeration(ad, moderationStatus) {
    moderationMutation.mutate({ id: ad.advertisementId, moderationStatus });
  }

  function handleClose(ad) {
    if (!confirm(`Vill du stänga annonsen "${ad.title}"?`)) return;
    statusMutation.mutate({
      id: ad.advertisementId,
      status: ADVERTISEMENT_STATUS.CLOSED,
    });
  }

  function handleDelete(ad) {
    if (!confirm(`Är du säker på att du vill ta bort "${ad.title}"? Detta går inte att ångra.`)) return;
    deleteMutation.mutate(ad.advertisementId);
  }

  function toggleReports(id) {
    setExpandedReports((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openPreview(ad) {
    setPreviewAd(ad);
  }

  function closePreview() {
    setPreviewAd(null);
  }

  if (isLoading) return <section className="page"><p>Laddar annonser...</p></section>;
  if (isError) return <section className="page"><p>Fel vid hämtning av annonser.</p></section>;

  const sorted = [...ads].sort((a, b) => {
    const incomingDelta = Number(isIncoming(b)) - Number(isIncoming(a));
    if (incomingDelta !== 0) return incomingDelta;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filtered = sorted.filter((ad) => {
    if (filter === "INKOMMANDE") return isIncoming(ad);
    if (filter === "GODKANDA") return ad.moderationStatus === MODERATION_STATUS.APPROVED;
    if (filter === "AVVISADE") return ad.moderationStatus === MODERATION_STATUS.REJECTED;
    if (filter === "STANGDA") return ad.status === ADVERTISEMENT_STATUS.CLOSED;
    if (filter === "RAPPORTERADE") return ad.reports?.length > 0;
    return true;
  });

  const total = sorted.length;
  const incomingCount = sorted.filter(isIncoming).length;
  const approvedCount = sorted.filter(
    (ad) => ad.moderationStatus === MODERATION_STATUS.APPROVED
  ).length;
  const rejectedCount = sorted.filter(
    (ad) => ad.moderationStatus === MODERATION_STATUS.REJECTED
  ).length;
  const closedCount = sorted.filter(
    (ad) => ad.status === ADVERTISEMENT_STATUS.CLOSED
  ).length;
  const reportedCount = sorted.filter((ad) => ad.reports?.length > 0).length;

  return (
    <section className="page">
      <div className="admin-header">
        <h1>Adminportal</h1>
        <p className="admin-subtitle">
          Se inkommande annonser och godkänn, avvisa eller stäng dem innan de blir liggande.
        </p>
        <div className="admin-stats">
          <span className="admin-stat"><strong>{total}</strong> totalt</span>
          <span className="admin-stat admin-stat--visible"><strong>{incomingCount}</strong> inkommande</span>
          <span className="admin-stat" style={{ background: "#dcfce7", color: "#166534" }}>
            <strong>{approvedCount}</strong> godkända
          </span>
          <span className="admin-stat admin-stat--hidden"><strong>{rejectedCount}</strong> avvisade</span>
          <span className="admin-stat" style={{ background: "#e5e7eb", color: "#374151" }}>
            <strong>{closedCount}</strong> stängda
          </span>
          <span className="admin-stat admin-stat--reported"><strong>{reportedCount}</strong> rapporterade</span>
        </div>
      </div>

      <div className="admin-filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`admin-filter-btn${filter === key ? " admin-filter-btn--active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            {key === "INKOMMANDE" && incomingCount > 0 && (
              <span className="admin-filter-badge" style={{ background: "#f97316" }}>
                {incomingCount}
              </span>
            )}
            {key === "RAPPORTERADE" && reportedCount > 0 && (
              <span className="admin-filter-badge">{reportedCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-table-wrapper">
        {filtered.length === 0 ? (
          <p style={{ padding: "24px", color: "#6b7280", textAlign: "center" }}>
            Inga annonser matchar filtret.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titel</th>
                <th>Typ</th>
                <th>Granskning</th>
                <th>Status</th>
                <th>Stad</th>
                <th>Skapad</th>
                <th>Synlig</th>
                <th>Rapporter</th>
                <th>Åtgärd</th>
                <th>Ta bort</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ad) => {
                const isReported = ad.reports?.length > 0;
                const isExpanded = expandedReports.has(ad.advertisementId);
                const isPending = ad.moderationStatus === MODERATION_STATUS.PENDING;
                const isClosed = ad.status === ADVERTISEMENT_STATUS.CLOSED;
                const isBusy = (
                  (moderationMutation.isPending && moderationMutation.variables?.id === ad.advertisementId)
                  || (statusMutation.isPending && statusMutation.variables?.id === ad.advertisementId)
                  || (deleteMutation.isPending && deleteMutation.variables === ad.advertisementId)
                );

                return (
                  <Fragment key={ad.advertisementId}>
                    <tr
                      className={[
                        isReported ? "admin-row--reported" : "",
                        !ad.isVisible && !isPending ? "admin-row--hidden" : "",
                      ].join(" ").trim()}
                    >
                      <td className="admin-cell-id">#{ad.advertisementId}</td>
                      <td className="admin-cell-title">
                        <button
                          type="button"
                          onClick={() => openPreview(ad)}
                          style={previewButtonStyle}
                        >
                          {ad.title}
                        </button>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${ad.type === 0 ? "lost" : "found"}`}>
                          {ad.type === 0 ? "Borttappad" : "Hittad"}
                        </span>
                      </td>
                      <td>
                        <span style={moderationBadgeStyle(ad.moderationStatus)}>
                          {moderationLabel(ad.moderationStatus)}
                        </span>
                      </td>
                      <td><span className="admin-status">{statusLabel(ad.status)}</span></td>
                      <td>{ad.location?.city ?? "-"}</td>
                      <td>{new Date(ad.createdAt).toLocaleDateString("sv-SE")}</td>
                      <td>
                        <span className={`admin-visibility ${ad.isVisible ? "admin-visibility--yes" : "admin-visibility--no"}`}>
                          {ad.isVisible ? "Ja" : "Nej"}
                        </span>
                      </td>
                      <td>
                        {isReported ? (
                          <button
                            className="admin-reports-btn"
                            onClick={() => toggleReports(ad.advertisementId)}
                          >
                            {ad.reports.length} rapport{ad.reports.length !== 1 ? "er" : ""}
                            <span style={{ marginLeft: 4 }}>{isExpanded ? "Dölj" : "Visa"}</span>
                          </button>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={actionGroupStyle}>
                          {isPending && !isClosed ? (
                            <>
                              <button
                                className="btn btn-show"
                                onClick={() => handleModeration(ad, MODERATION_STATUS.APPROVED)}
                                disabled={isBusy}
                              >
                                Godkänn
                              </button>
                              <button
                                className="btn btn-hide"
                                onClick={() => handleModeration(ad, MODERATION_STATUS.REJECTED)}
                                disabled={isBusy}
                              >
                                Avvisa
                              </button>
                              <button
                                className="btn"
                                style={closeButtonStyle}
                                onClick={() => handleClose(ad)}
                                disabled={isBusy}
                              >
                                Stäng
                              </button>
                            </>
                          ) : (
                            <span style={actionStateStyle}>
                              {isClosed
                                ? "Stängd"
                                : ad.moderationStatus === MODERATION_STATUS.APPROVED
                                  ? "Godkänd"
                                  : "Avvisad"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(ad)}
                          disabled={isBusy}
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="admin-row--reports-expanded">
                        <td colSpan={11}>
                          <div className="admin-reports-list">
                            <p className="admin-reports-heading">Rapportkommentarer</p>
                            {ad.reports.map((report) => (
                              <div key={report.reportId} className="admin-report-item">
                                <span className="admin-report-date">
                                  {new Date(report.createdAt).toLocaleDateString("sv-SE")}
                                </span>
                                {report.commentId && (
                                  <span className="admin-report-tag">Kommentar #{report.commentId}</span>
                                )}
                                <span className="admin-report-comment">{report.comment}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {previewAd && (
        <div
          onClick={closePreview}
          style={previewOverlayStyle}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={previewModalStyle}
          >
            <div style={previewHeaderStyle}>
              <div>
                <p style={previewEyebrowStyle}>Adminförhandsvisning</p>
                <h2 style={{ margin: 0 }}>{previewAd.title}</h2>
              </div>
              <button
                type="button"
                onClick={closePreview}
                style={previewCloseButtonStyle}
              >
                Stäng
              </button>
            </div>

            {previewAd.moderationStatus === MODERATION_STATUS.APPROVED && (
              <div style={{ marginTop: "-4px" }}>
                <Link
                  to={`/advertisements/${previewAd.advertisementId}`}
                  style={{ color: "#f97316", fontWeight: 600 }}
                >
                  Öppna publik annonssida
                </Link>
              </div>
            )}

            <div style={previewBodyStyle}>
              <div style={previewImagePanelStyle}>
                {previewImages.length > 0 ? (
                    <img
                    src={resolveBackendAssetUrl(previewImages[0].imageUrl)}
                    alt={previewAd.title}
                    style={previewImageStyle}
                  />
                ) : (
                  <div style={previewImagePlaceholderStyle}>Ingen bild uppladdad</div>
                )}
              </div>

              <div style={previewInfoPanelStyle}>
                <div style={previewBadgeRowStyle}>
                  <span className={`admin-badge admin-badge--${previewAd.type === 0 ? "lost" : "found"}`}>
                    {previewAd.type === 0 ? "Borttappad" : "Hittad"}
                  </span>
                  <span style={moderationBadgeStyle(previewAd.moderationStatus)}>
                    {moderationLabel(previewAd.moderationStatus)}
                  </span>
                  <span style={statusChipStyle}>
                    {statusLabel(previewAd.status)}
                  </span>
                </div>

                <p style={previewDescriptionStyle}>{previewAd.description || "Ingen beskrivning."}</p>

                <div style={previewMetaGridStyle}>
                  <PreviewField label="Katt" value={previewAd.cat?.name || "-"} subvalue={previewAd.cat?.breed || previewAd.cat?.furColor || ""} />
                  <PreviewField label="Plats" value={previewAd.location?.city || "-"} subvalue={previewAd.location?.area || ""} />
                  <PreviewField label="Kontakt" value={previewAd.contactPhoneNumber || previewAd.contactEmail || "-"} subvalue={previewAd.contactPhoneNumber && previewAd.contactEmail ? previewAd.contactEmail : ""} />
                  <PreviewField label="Skapad" value={new Date(previewAd.createdAt).toLocaleDateString("sv-SE")} subvalue={`Annons #${previewAd.advertisementId}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PreviewField({ label, value, subvalue }) {
  return (
    <div style={previewFieldStyle}>
      <p style={previewFieldLabelStyle}>{label}</p>
      <p style={previewFieldValueStyle}>{value}</p>
      {subvalue ? <p style={previewFieldSubvalueStyle}>{subvalue}</p> : null}
    </div>
  );
}

function isIncoming(ad) {
  return ad.moderationStatus === MODERATION_STATUS.PENDING
    && ad.status !== ADVERTISEMENT_STATUS.CLOSED;
}

function statusLabel(status) {
  switch (status) {
    case ADVERTISEMENT_STATUS.ACTIVE:
      return "Aktiv";
    case ADVERTISEMENT_STATUS.RESOLVED:
      return "Löst";
    case ADVERTISEMENT_STATUS.CLOSED:
      return "Stängd";
    default:
      return status;
  }
}

function moderationLabel(status) {
  switch (status) {
    case MODERATION_STATUS.APPROVED:
      return "Godkänd";
    case MODERATION_STATUS.PENDING:
      return "Väntar";
    case MODERATION_STATUS.REJECTED:
      return "Avvisad";
    default:
      return status;
  }
}

function moderationBadgeStyle(status) {
  if (status === MODERATION_STATUS.APPROVED) {
    return badgeStyle("#dcfce7", "#166534");
  }

  if (status === MODERATION_STATUS.REJECTED) {
    return badgeStyle("#fee2e2", "#991b1b");
  }

  return badgeStyle("#ffedd5", "#c2410c");
}

function badgeStyle(background, color) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background,
    color,
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

const actionGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const actionStateStyle = {
  color: "#6b7280",
  fontSize: "0.82rem",
  fontWeight: 600,
};

const closeButtonStyle = {
  background: "#e5e7eb",
  color: "#374151",
  fontSize: "0.82rem",
  padding: "7px 14px",
  "--_ear": "#cbd5e1",
  "--_tail": "#cbd5e1",
};

const previewButtonStyle = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#111827",
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
};

const previewOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "rgba(15, 23, 42, 0.52)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const previewModalStyle = {
  width: "min(980px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#faf8f5",
  borderRadius: "28px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.22)",
  padding: "28px",
  display: "grid",
  gap: "20px",
};

const previewHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px",
};

const previewEyebrowStyle = {
  margin: "0 0 6px",
  color: "#f97316",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "0.75rem",
};

const previewCloseButtonStyle = {
  background: "none",
  border: "1px solid #e5e7eb",
  borderRadius: "999px",
  padding: "10px 16px",
  cursor: "pointer",
  color: "#6b7280",
  fontWeight: 600,
};

const previewBodyStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 0.95fr) minmax(320px, 1.05fr)",
  gap: "20px",
};

const previewImagePanelStyle = {
  minHeight: "320px",
  borderRadius: "24px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  background: "#f3f4f6",
};

const previewImageStyle = {
  width: "100%",
  height: "100%",
  minHeight: "320px",
  objectFit: "cover",
  display: "block",
};

const previewImagePlaceholderStyle = {
  width: "100%",
  minHeight: "320px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  fontWeight: 600,
};

const previewInfoPanelStyle = {
  display: "grid",
  gap: "18px",
  alignContent: "start",
};

const previewBadgeRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
};

const previewDescriptionStyle = {
  margin: 0,
  color: "#4b5563",
  lineHeight: 1.7,
};

const previewMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const previewFieldStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "14px 16px",
};

const previewFieldLabelStyle = {
  margin: "0 0 6px",
  color: "#9ca3af",
  fontWeight: 700,
  fontSize: "0.76rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const previewFieldValueStyle = {
  margin: 0,
  color: "#111827",
  fontWeight: 600,
};

const previewFieldSubvalueStyle = {
  margin: "4px 0 0",
  color: "#6b7280",
  fontSize: "0.9rem",
};

const statusChipStyle = {
  ...badgeStyle("#e5e7eb", "#374151"),
};
