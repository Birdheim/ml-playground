// components/Navbar.tsx
import { Link } from 'react-router-dom'
import './Navbar.css'

interface NavbarProps {
  isLight: boolean
}

function Navbar({ isLight }: NavbarProps) {
  const textColor = isLight ? 'var(--color-text-primary)' : 'var(--color-text-light)'

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side - Logo */}
        <Link to="/" className="navbar-logo" style={{ color: textColor }}>
          <span className="navbar-logo-ml">ML</span>
          <span> Playground</span>
        </Link>

        {/* Right side - Menu */}
        <div className="navbar-menu">
          <Link to="/resources" className="navbar-link" style={{ color: textColor }}>
            Resources
          </Link>
          <Link to="/playground" className="navbar-link" style={{ color: textColor }}>
            Playground
          </Link>
          <Link to="/about" className="navbar-link" style={{ color: textColor }}>
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar