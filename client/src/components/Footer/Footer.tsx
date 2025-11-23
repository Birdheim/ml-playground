import AutoSizeText from '../AutoSizeText';
import ThemeToggle from '../ThemeToggle';
import './Footer.css'

function Footer() {

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>ML Models</h3>
          <ul>
            <li>Regression</li>
            <li>Classification</li>
            <li>Neural Nets</li>
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
      <div className="footer-bottom">
        <AutoSizeText boldText="Machine Learning" regularText="Playground" />
      </div>
    </footer>
  );
}

export default Footer;
