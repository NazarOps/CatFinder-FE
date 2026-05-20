import { Link } from "react-router-dom";

// NotFoundPage - 404-sida när URL inte finns
export default function NotFoundPage() {
  return (
    <section className="page">
      <h1>Sidan hittades inte</h1>
      <Link to="/">Till startsidan</Link>
    </section>
  );
}
