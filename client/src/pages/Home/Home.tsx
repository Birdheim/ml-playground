import { useEffect, useState } from 'react'
import HeroSection from './sections/HeroSection'
import VisualizationSection from './sections/VisualizationSection'
import './Home.css'

function Home() {
  const [message, setMessage] = useState<string>('Loading...')
  const [error, setError] = useState<string | null>(null)

  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => {
        if (!res.ok) throw new Error('Backend not responding')
        return res.json()
      })
      .then(data => setMessage(data.message))
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    if (message || error) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000); // Dismisses after 4 seconds

      return () => clearTimeout(timer); // Cleanup
    }
  }, [message, error]);


  const notificationStyle = {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 9999,
    animation: 'slideIn 0.3s ease-out',
  };

  return (
    <div className="home">
      <HeroSection />
      <VisualizationSection />

      {/* Backend status - remove in production */}
      {showNotification && (
        error ? (
          <div style={{
            ...notificationStyle,
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
          }}>
            ⚠️ Backend: {error}
          </div>
        ) : message && (
          <div style={{
            ...notificationStyle,
            background: '#efe',
            color: '#3a3',
            border: '1px solid #cfc',
          }}>
            ✓ {message}
          </div>
        )
      )}
    </div>
  )
}

export default Home