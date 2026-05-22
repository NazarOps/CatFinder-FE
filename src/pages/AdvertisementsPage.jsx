import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import AdvertisementCard from "../components/advertisements/AdvertisementCard";
import { advertisementService } from "../services/advertisementService";
import { useAuthStore } from "../store/authStore";

const PAGE_SIZE = 12;

export default function AdvertisementsPage() {
  const user = useAuthStore((state) => state.user);
  const [filterCity, setFilterCity] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["advertisements", filterCity],
    queryFn: ({ pageParam = 0 }) =>
      advertisementService.getAll({ skip: pageParam, take: PAGE_SIZE, city: filterCity }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });

  const { data: savedIds = new Set() } = useQuery({
    queryKey: ["savedAdvertisements", user?.accountId],
    queryFn: () => advertisementService.getSaved(user.accountId),
    select: (ads) => new Set(ads.map((ad) => ad.advertisementId)),
    enabled: !!user?.accountId,
  });

  const allAdvertisements = useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const areas = useMemo(() => {
    if (!filterCity) return [];
    const unique = new Set(
      allAdvertisements
        .filter((a) => a.location?.city === filterCity)
        .map((a) => a.location?.area)
        .filter(Boolean)
    );
    return [...unique].sort();
  }, [allAdvertisements, filterCity]);

  const filtered = useMemo(() => {
    if (!filterArea) return allAdvertisements;
    return allAdvertisements.filter((a) => a.location?.area === filterArea);
  }, [allAdvertisements, filterArea]);

  function handleCityChange(e) {
    setFilterCity(e.target.value);
    setFilterArea("");
  }

  if (isLoading) return <section className="page">Laddar annonser...</section>;
  if (isError) return <section className="page">Kunde inte hämta annonser.</section>;

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
          {[...new Set(allAdvertisements.map((a) => a.location?.city).filter(Boolean))].sort().map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>

        <select
          className="input"
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          disabled={!filterCity || areas.length === 0}
          style={{ width: "auto", minWidth: 180 }}
        >
          <option value="">{filterCity ? "Alla områden" : "Välj stad först"}</option>
          {areas.map((area) => (
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
          {filtered.map((advertisement) => (
            <AdvertisementCard
              key={advertisement.advertisementId}
              advertisement={advertisement}
              isSaved={savedIds.has(advertisement.advertisementId)}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn btn-light"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{ minWidth: 160 }}
          >
            {isFetchingNextPage ? "Laddar..." : "Ladda fler"}
          </button>
        </div>
      )}

    </section>
  );
}
