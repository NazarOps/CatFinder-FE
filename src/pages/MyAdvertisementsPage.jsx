import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { advertisementService } from "../services/advertisementService";

const statusLabel = { 0: "Aktiv", 1: "Löst", 2: "Stängd" };
const typeLabel = { 0: "Borttappad", 1: "Hittad" };

export default function MyAdvertisementsPage() {
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading, isError } = useQuery({
    queryKey: ["my-advertisements"],
    queryFn: advertisementService.getMine,
  });

  async function handleDelete(ad) {
    if (!confirm(`Ta bort "${ad.title}"? Detta går inte att ångra.`)) return;
    try {
      await advertisementService.delete(ad.advertisementId);
      queryClient.invalidateQueries({ queryKey: ["my-advertisements"] });
    } catch (err) {
      alert("Kunde inte ta bort annonsen: " + (err.response?.data?.title || err.message));
    }
  }

  if (isLoading) return <section className="page">Laddar dina annonser...</section>;
  if (isError) return <section className="page">Kunde inte hämta dina annonser.</section>;

  return (
    <section className="page" style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ margin: "0 0 4px" }}>Mina annonser</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          {ads.length} annons{ads.length !== 1 ? "er" : ""}
        </p>
      </div>

      {ads.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ color: "#9ca3af", margin: "0 0 16px" }}>
            Du har inte skapat några annonser ännu.
          </p>
          <Link className="btn btn-orange" to="/advertisements/create">
            Skapa annons
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ads.map((ad) => (
            <div
              key={ad.advertisementId}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 20px",
                opacity: ad.isVisible ? 1 : 0.65,
              }}
            >
              <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                    {ad.title}
                  </span>
                  {!ad.isVisible && (
                    <span style={{
                      background: "#fee2e2", color: "#991b1b",
                      fontSize: "0.72rem", fontWeight: 700,
                      padding: "2px 8px", borderRadius: 999,
                    }}>
                      Dold av admin
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {typeLabel[ad.type] ?? ad.type}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>·</span>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {statusLabel[ad.status] ?? ad.status}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>·</span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    {ad.location?.city ?? "Okänd plats"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>·</span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    {new Date(ad.createdAt).toLocaleDateString("sv-SE")}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  to={`/advertisements/${ad.advertisementId}`}
                  className="btn btn-orange"
                  style={{ padding: "7px 16px", fontSize: "0.85rem" }}
                >
                  Visa
                </Link>
                <button
                  onClick={() => handleDelete(ad)}
                  style={{
                    background: "none", border: "1px solid #fca5a5", color: "#ef4444",
                    borderRadius: 999, padding: "7px 16px", cursor: "pointer",
                    fontWeight: 600, fontSize: "0.85rem",
                  }}
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
