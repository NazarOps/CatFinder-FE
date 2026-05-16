import { useQuery } from "@tanstack/react-query";
import AdvertisementCard from "../components/advertisements/AdvertisementCard";
import { advertisementService } from "../services/advertisementService";

// AdvertisementsPage - visar alla annonser i ett rutnät
export default function AdvertisementsPage() {
  const {
    data: advertisements = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advertisements"],
    queryFn: advertisementService.getAll,
  });

  if (isLoading) {
    return <section className="page">Laddar annonser...</section>;
  }

  if (isError) {
    return <section className="page">Kunde inte hämta annonser.</section>;
  }

  return (
    <section className="page">
      <div className="grid">
        {advertisements.map((advertisement) => (
          <AdvertisementCard
            key={advertisement.advertisementId}
            advertisement={advertisement}
          />
        ))}
      </div>
    </section>
  );
}
