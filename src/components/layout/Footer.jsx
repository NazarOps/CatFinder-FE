import { Link } from "react-router-dom";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        <div className="site-footer__brand">
          <span className="site-footer__logo">CatFinder</span>
          <p className="site-footer__tagline">
            Helping reunite cats with their families across Sweden.
          </p>
        </div>

        <div className="site-footer__col">
          <h4 className="site-footer__heading">Quick links</h4>
          <ul className="site-footer__list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/advertisements">Advertisements</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/login">Sign in</Link></li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h4 className="site-footer__heading">Contact</h4>
          <ul className="site-footer__list site-footer__list--contact">
            <li>
              <span className="site-footer__contact-label">Owner</span>
              <span>Nazar</span>
            </li>
            <li>
              <span className="site-footer__contact-label">Tech support</span>
              <span>support@catfinder.site</span>
            </li>
            <li>
              <span className="site-footer__contact-label">General questions</span>
            </li>
            <li>
              <a href="mailto:support@catfinder.se">ask@catfinder.site</a>
            </li>
          </ul>
        </div>

      </div>

      <div className="site-footer__bottom">
        <p>
          &copy; {YEAR} CatFinder. All rights reserved.&ensp;&middot;&ensp;
          CatFinder&trade; is a registered trademark of CatFinder AB.&ensp;&middot;&ensp;
          <Link to="/privacy">Privacy policy</Link>&ensp;&middot;&ensp;
          <Link to="/terms">Terms of use</Link>
        </p>
      </div>
    </footer>
  );
}
