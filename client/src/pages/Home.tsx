import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import robotSvg from '../assets/Eve.svg';
import './Home.css'

function Home() {
    const navigate = useNavigate()
    const [message, setMessage] = useState<string>('Loafing...')
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
        // Call backend health check
        fetch('http://localhost:8000/')
        .then(res => {
            if (!res.ok) throw new Error('Backend not responding')
            return res.json()
        })
        .then(data => {
            setMessage(data.message)
        })
        .catch(err => {
            setError(err.message)
        })
    }, [])
  
  return (
    <>
    <div className='home'> 
        {/* Hero Section */}
        <section className="hero">
            <div className="hero-container">
            <div className="hero-content">
                <p className="hero-subtitle">Welcome to the</p>
                <h1 className="hero-title">
                    <span className="hero-title-highlight">Machine Learning</span> Playground
                </h1>
                <button 
                className="hero-button"
                onClick={() => navigate('/playground')}
                >
                Go to Playground →
                </button>
            </div>
            <div className="hero-image">
                {/* Robot placeholder */}
                <img src={robotSvg} alt="ML Robot" className="robot-image" />

            </div>
            </div>
        </section>

        {/* Feature Cards */}
        <section className="features">
            <div className="features-container">
            <div className="feature-card">
                <p>Heard about Machine Learning, but still not quite sure what it's all about?</p>
            </div>
            <div className="feature-card">
                <p>Want a quick and easy way of understanding key concepts?</p>
            </div>
            <div className="feature-card">
                <p>Curious to try ML without needing any math or coding background?</p>
            </div>
            </div>
        </section>

        {/* Visualization Section */}
        <section className="visualization">
            <div className="visualization-container">
            <div className="visualization-image">
                {/* Contour map placeholder */}
                <div className="contour-placeholder">
                <svg viewBox="0 0 300 300" className="contour-svg">
                    <path d="M50,150 Q100,100 150,150 T250,150" stroke="white" fill="none" strokeWidth="2"/>
                    <path d="M60,160 Q110,110 160,160 T260,160" stroke="white" fill="none" strokeWidth="2"/>
                    <path d="M70,170 Q120,120 170,170 T270,170" stroke="white" fill="none" strokeWidth="2"/>
                    <path d="M40,140 Q90,90 140,140 T240,140" stroke="white" fill="none" strokeWidth="2"/>
                </svg>
                </div>
            </div>
            <div className="visualization-text">
                <h2>Interactive Visualizations</h2>
                <p>
                Explore machine learning concepts through interactive visualizations. 
                See how different algorithms work in real-time and understand the 
                mathematics behind them with intuitive visual representations.
                </p>
                <p>
                Experiment with parameters and immediately observe how they affect 
                model behavior. Perfect for both beginners and experienced practitioners.
                </p>
            </div>
            </div>
        </section>

        {error ? (
            <p style={{color: 'red'}}>Error: {error}</p>
        ): (
            <>
            <p style={{color: 'green'}}>Backend message: {message}</p>
            <p>Backend works</p>
            </>
        )}

        {/* Footer */}
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
            <div className="footer-section">
                <ul className="footer-contact">
                <li>Email: herman.bergheim@gmail.com</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
                </ul>
            </div>
            </div>
            <div className="footer-bottom">
                <p>Made with love and joy by Herman Bergheim</p>
                <ThemeToggle />
            </div>
        </footer>
    </div>
    </>
  )
}

export default Home
