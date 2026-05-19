import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import AdvertisementCard from "../components/advertisements/AdvertisementCard";
import { advertisementService } from "../services/advertisementService";

export default function AdvertisementsPage() {
  const [filterCity, setFilterCity] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const {
    data: advertisements = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advertisements"],
    queryFn: advertisementService.getAll,
  });

  const cities = useMemo(() => {
    const unique = new Set(advertisements.map(a => a.location?.city).filter(Boolean));
    return [...unique].sort();
  }, [advertisements]);

  const areas = useMemo(() => {
    if (!filterCity) return [];
    const unique = new Set(
      advertisements
        .filter(a => a.location?.city === filterCity)
        .map(a => a.location?.area)
        .filter(Boolean)
    );
    return [...unique].sort();
  }, [advertisements, filterCity]);

  const filtered = useMemo(() => {
    return advertisements.filter(a => {
      if (filterCity && a.location?.city !== filterCity) return false;
      if (filterArea && a.location?.area !== filterArea) return false;
      return true;
    });
  }, [advertisements, filterCity, filterArea]);

  function handleCityChange(e) {
    setFilterCity(e.target.value);
    setFilterArea("");
  }

  if (isLoading) return <section className="page">Laddar annonser...</section>;
  if (isError)   return <section className="page">Kunde inte hämta annonser.</section>;

  return (
    <section className="page" style={{ display: "grid", gap: 24 }}>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select
          className="input"
          value={filterCity}
          onChange={handleCityChange}
          style={{ width: "auto", minWidth: 180 }}
        >
          <option value="">Alla städer</option>
          {cities.map(city => (
            <option key={city}>{city}</option>
          ))}
        </select>

        <select
          className="input"
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          disabled={!filterCity || areas.length === 0}
          style={{ width: "auto", minWidth: 180 }}
        >
          <option value="">{filterCity ? "Alla områden" : "Välj stad först"}</option>
          {areas.map(area => (
            <option key={area}>{area}</option>
          ))}
        </select>

        {(filterCity || filterArea) && (
          <button
            className="btn"
            style={{ background: "none", color: "#9ca3af", border: "1px solid #e5e7eb", fontWeight: 500 }}
            onClick={() => { setFilterCity(""); setFilterArea(""); }}
          >
            Rensa filter
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>Inga annonser hittades.</p>
      ) : (
        <div className="grid">
          {filtered.map(advertisement => (
            <AdvertisementCard
              key={advertisement.advertisementId}
              advertisement={advertisement}
            />
          ))}
        </div>
      )}

    </section>
  );
}
