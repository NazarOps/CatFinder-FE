import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { advertisementService } from "../services/advertisementService";
import FeaturedCarousel from "../components/advertisements/FeaturedCarousel";

export default function HomePage() {
  const { data: advertisements = [] } = useQuery({
    queryKey: ["advertisements"],
    queryFn: advertisementService.getAll,
  });

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

      <section className="mission-section">
        <div>
          <h2>Vår mission</h2>
          <p>
            Vi vill göra det enklare, snabbare och tryggare att hitta saknade
            katter genom att samla annonser, platsinformation och lokala tips på
            en tydlig plattform.
          </p>
        </div>

        <div className="mission-card">
          <h3>Varför CatFinder?</h3>
          <p>
            Facebookgrupper och lappar fungerar ibland, men informationen blir
            lätt svår att hitta. CatFinder strukturerar annonser så att fler kan
            hjälpa till.
          </p>
        </div>
      </section>

      <FeaturedCarousel advertisements={advertisements} />
    </section>
  );
}
