import { Link } from "react-router-dom";

// HomePage - startsida med hero-banner, mission och preview av aktuell annons
export default function HomePage() {
  const featuredAdvertisement = {
    id: 1,
    title: "Misse saknas i Majorna",
    description:
      "Grå katt med vit mage. Sågs senast nära Mariaplan på kvällen.",
    location: "Göteborg, Majorna",
    type: "Försvunnen katt",
    imageUrl: "https://i2.pickpik.com/photos/314/350/399/cat-kitten-cat-baby-young-cat-6aef1bbe5aa8dc9461e4deddbd8ce1d1.jpg",
  };

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

      <section className="preview-section">
        <div className="section-heading">
          <p>Aktuell annons</p>
          <h2>Senaste efterlysningen</h2>
        </div>

        <article className="preview-card">
          <img
            src={featuredAdvertisement.imageUrl}
            alt={featuredAdvertisement.title}
          />

          <div className="preview-content">
            <span className="badge">{featuredAdvertisement.type}</span>
            <h3>{featuredAdvertisement.title}</h3>
            <p>{featuredAdvertisement.description}</p>
            <p className="location-text">{featuredAdvertisement.location}</p>

            <Link
              className="btn btn-orange"
              to={`/advertisements/${featuredAdvertisement.id}`}
            >
              Läs mer
            </Link>
          </div>
        </article>
      </section>
    </section>
  );
}