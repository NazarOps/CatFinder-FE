import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { advertisementService } from "../services/advertisementService";
import FeaturedCarousel from "../components/advertisements/FeaturedCarousel";

export default function HomePage() {
  const { data: advertisements = [] } = useQuery({
    queryKey: ["advertisements"],
    queryFn: advertisementService.getAll,
  });

  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="home-page">
      <section className="hero-banner">
        <div className="hero-content">
          <p className="hero-tag">CatFinder Sverige</p>
          <h1>Hjälp bortsprungna katter att hitta hem igen</h1>
          <p>
            CatFinder är en plats där kattägare kan lägga upp annonser om
            saknade eller upphittade katter, dela platsinformation och få hjälp
            av människor i närområdet.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-orange" to="/advertisements">
              Visa aktuella annonser
            </Link>
            <Link className="btn btn-light" to="/advertisements/create">
              Skapa annons
            </Link>
          </div>
        </div>
      </section>

      <div className="mission-wrapper">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
          <div>
            <p className="hero-tag" style={{ marginBottom: 10 }}>Om oss</p>
            <h2 style={{ fontSize: "2.8rem", margin: "0 0 16px", lineHeight: 1.2 }}>Vår mission</h2>
            <p style={{ color: "#4b5563", lineHeight: 1.8, fontSize: "1.1rem", margin: 0 }}>
              Vi vill göra det enklare, snabbare och tryggare att hitta saknade
              katter genom att samla annonser, platsinformation och lokala tips på
              en tydlig plattform.
            </p>
          </div>

          <div className="mission-editorial">
            <h3>Varför CatFinder?</h3>
            <p>
              Facebookgrupper och lappar fungerar ibland, men informationen blir
              lätt svår att hitta. CatFinder strukturerar annonser så att fler kan
              hjälpa till.
            </p>
          </div>
        </div>

        <img
          ref={imgRef}
          src="/orangeboi.png"
          alt="Orange katt"
          className={`mission-lostcat${visible ? " mission-lostcat--visible" : ""}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", borderRadius: "0 20px 20px 0" }}
        />
      </div>

      <FeaturedCarousel advertisements={advertisements} />
    </section>
  );
}
