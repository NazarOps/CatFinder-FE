import { Link } from "react-router-dom";

// AdvertisementCard - visar en annons i kort format med titel, beskrivning och plats
export default function AdvertisementCard({ advertisement }) {
  return (
    <article className="card">
      <p style={{ margin: 0, color: "#6b7280" }}>
        {advertisement.type}
      </p>
      <h3>{advertisement.title}</h3>
      <p>{advertisement.description}</p>
      <p>
        <strong>Plats:</strong> {advertisement.location?.city ?? "Okänd plats"}
      </p>
      <Link className="btn" to={`/advertisements/${advertisement.advertisementId}`}>
        Visa annons
      </Link>
    </article>
  );
}
