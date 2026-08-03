import AutoSizeText from '../AutoSizeText';
import ThemeToggle from '../ThemeToggle';
import './Footer.css'

function Footer() {

  return (
    <footer className="footer">
      <div className="footer-container page-container">
        {/* Two of these three were listed flat alongside classification, which
            promised a visitor two whole capabilities that do not exist. Marked
            the same way the locked cards in the gallery are, so the site says
            one thing about what is built. */}
        <div className="footer-section">
          <h3>ML Models</h3>
          <ul>
            <li>Classification</li>
            <li className="footer-unbuilt">Regression <span>— not yet</span></li>
            <li className="footer-unbuilt">Neural Nets <span>— not yet</span></li>
          </ul>
        </div>
        <div className='footer-section-middel'>
          <p>Made with love and joy by Herman Bergheim</p>
          <ThemeToggle />
        </div>
        <div className="footer-section">
          <ul className="footer-contact">
            <li>Email: herman.bergheim@gmail.com</li>
            <li>LinkedIn</li>
            <li>GitHub</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom-logo page-container">
        <AutoSizeText boldText="Machine Learning" regularText="Playground" />
      </div>
    </footer>
  );
}

export default Footer;
