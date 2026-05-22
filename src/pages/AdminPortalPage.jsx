import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";

const FILTERS = [
  { key: "ALLA", label: "Alla" },
  { key: "AKTIVA", label: "Aktiva" },
  { key: "OAKTIVA", label: "Oaktiva" },
  { key: "RAPPORTERADE", label: "Rapporterade" },
];

export default function AdminPortalPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALLA");
  const [expandedReports, setExpandedReports] = useState(new Set());

  const { data: ads, isLoading, isError } = useQuery({
    queryKey: ["admin-advertisements"],
    queryFn: adminService.getAllAdvertisements,
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }) => adminService.setVisibility(id, isVisible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] }),
    onError: () => alert("Kunde inte uppdatera annonsens synlighet."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteAdvertisement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] }),
    onError: () => alert("Kunde inte ta bort annonsen."),
  });

  function toggleVisibility(ad) {
    visibilityMutation.mutate({ id: ad.advertisementId, isVisible: !ad.isVisible });
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

  if (isLoading) return <section className="page"><p>Laddar annonser...</p></section>;
  if (isError) return <section className="page"><p>Fel vid hämtning av annonser.</p></section>;

  const sorted = [...(ads ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filtered = sorted.filter((ad) => {
    if (filter === "AKTIVA") return ad.isVisible;
    if (filter === "OAKTIVA") return !ad.isVisible;
    if (filter === "RAPPORTERADE") return ad.reports?.length > 0;
    return true;
  });

  const total = sorted.length;
  const activeCount = sorted.filter((a) => a.isVisible).length;
  const hiddenCount = sorted.filter((a) => !a.isVisible).length;
  const reportedCount = sorted.filter((a) => a.reports?.length > 0).length;

  return (
    <section className="page">
      <div className="admin-header">
        <h1>Adminportal</h1>
        <p className="admin-subtitle">
          Hantera annonsers synlighet och granska rapporter.
        </p>
        <div className="admin-stats">
          <span className="admin-stat"><strong>{total}</strong> totalt</span>
          <span className="admin-stat admin-stat--visible"><strong>{activeCount}</strong> aktiva</span>
          <span className="admin-stat admin-stat--hidden"><strong>{hiddenCount}</strong> oaktiva</span>
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
                return (
                  <>
                    <tr
                      key={ad.advertisementId}
                      className={[
                        isReported ? "admin-row--reported" : "",
                        ad.isVisible ? "" : "admin-row--hidden",
                      ].join(" ").trim()}
                    >
                      <td className="admin-cell-id">#{ad.advertisementId}</td>
                      <td className="admin-cell-title">{ad.title}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${ad.type === 0 ? "lost" : "found"}`}>
                          {ad.type === 0 ? "Borttappad" : "Hittad"}
                        </span>
                      </td>
                      <td><span className="admin-status">{statusLabel(ad.status)}</span></td>
                      <td>{ad.location?.city ?? "—"}</td>
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
                            <span style={{ marginLeft: 4 }}>{isExpanded ? "▲" : "▼"}</span>
                          </button>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn ${ad.isVisible ? "btn-hide" : "btn-show"}`}
                          onClick={() => toggleVisibility(ad)}
                          disabled={visibilityMutation.isPending}
                        >
                          {ad.isVisible ? "Dölj" : "Visa"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(ad)}
                          disabled={deleteMutation.isPending}
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`reports-${ad.advertisementId}`} className="admin-row--reports-expanded">
                        <td colSpan={10}>
                          <div className="admin-reports-list">
                            <p className="admin-reports-heading">Rapportkommentarer</p>
                            {ad.reports.map((r) => (
                              <div key={r.reportId} className="admin-report-item">
                                <span className="admin-report-date">
                                  {new Date(r.createdAt).toLocaleDateString("sv-SE")}
                                </span>
                                {r.commentId && (
                                  <span className="admin-report-tag">Kommentar #{r.commentId}</span>
                                )}
                                <span className="admin-report-comment">{r.comment}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function statusLabel(status) {
  switch (status) {
    case 0: return "Aktiv";
    case 1: return "Löst";
    case 2: return "Stängd";
    default: return status;
  }
}
