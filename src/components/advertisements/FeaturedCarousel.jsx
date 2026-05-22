import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { advertisementImageService } from "../../services/advertisementImageService";

const typeLabel = { 0: "Försvunnen katt", 1: "Hittad katt" };

function CarouselSlide({ advertisement }) {
  const { data: images = [] } = useQuery({
    queryKey: ["advertisementImages", advertisement.advertisementId],
    queryFn: () => advertisementImageService.getByAdvertisement(advertisement.advertisementId),
    enabled: !advertisement.primaryImageUrl,
  });

  const imageUrl = advertisement.primaryImageUrl ?? images[0]?.imageUrl;

  return (
    <article className="preview-card">
      <div className="preview-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={advertisement.title} />
        ) : (
          <div className="preview-no-image">Bild ej tillgänglig</div>
        )}
      </div>
      <div className="preview-content">
        <span className="badge">{typeLabel[advertisement.type] ?? "Katt"}</span>
        <h3>{advertisement.title}</h3>
        <p>{advertisement.description}</p>
        <p className="location-text">
          {advertisement.location?.city}
          {advertisement.location?.area ? `, ${advertisement.location.area}` : ""}
        </p>
        <Link className="btn btn-orange" to={`/advertisements/${advertisement.advertisementId}`}>
          Läs mer
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedCarousel({ advertisements }) {
  const [index, setIndex] = useState(0);

  const top5 = useMemo(
    () =>
      [...advertisements]
        .sort((a, b) => b.advertisementId - a.advertisementId)
        .slice(0, 5),
    [advertisements]
  );

  useEffect(() => {
    if (top5.length <= 1) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % top5.length), 5000);
    return () => clearInterval(timer);
  }, [top5.length]);

  if (top5.length === 0) return null;

  return (
    <section className="preview-section">
      <div className="section-heading">
        <h2>Senaste efterlysningarna</h2>
      </div>

      <CarouselSlide advertisement={top5[index]} />

      {top5.length > 1 && (
        <div className="carousel-dots">
          {top5.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Visa annons ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
