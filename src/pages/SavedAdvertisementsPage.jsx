import { useQuery } from "@tanstack/react-query";
import AdvertisementCard from "../components/advertisements/AdvertisementCard";
import { advertisementService } from "../services/advertisementService";

export default function SavedAdvertisementsPage() {
  const { data: advertisements = [], isLoading, isError } = useQuery({
    queryKey: ["savedAdvertisements"],
    queryFn: advertisementService.getSaved,
  });

  if (isLoading) return <section className="page">Laddar sparade annonser...</section>;
  if (isError)   return <section className="page">Kunde inte hämta sparade annonser.</section>;

  return (
    <section className="page" style={{ display: "grid", gap: 24 }}>
      <h1 style={{ margin: 0 }}>Sparade annonser</h1>

      {advertisements.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>Du har inga sparade annonser ännu.</p>
      ) : (
        <div className="grid">
          {advertisements.map(advertisement => (
            <AdvertisementCard
              key={advertisement.advertisementId}
              advertisement={{ ...advertisement, isSaved: true }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
