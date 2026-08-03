import { useEffect, useState } from 'react'
import HeroSection from './sections/HeroSection'
import HowItWorksSection from './sections/HowItWorksSection'
import { api } from '../../services/api'
import './Home.css'

function Home() {
  // Only failure is worth saying out loud. A green "backend is up and running"
  // toast greeted every visitor on the front page, which is a developer's
  // reassurance shown to an audience who has no idea what a backend is. The
  // error is different: without it, a visitor whose server is down just sees
  // the playground load placeholders forever with no explanation. It also no
  // longer dismisses itself after four seconds, because a problem that
  // disappears while you are still reading it is worse than no message at all.
  const [isDown, setIsDown] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.healthCheck().catch(() => { if (!cancelled) setIsDown(true) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="home">
      <HeroSection />
      <HowItWorksSection />

      {isDown && (
        <p className="home-offline" role="status">
          Eve can't reach the server, so the playground won't run. If you're running
          this yourself, start the backend on port 8000.
        </p>
      )}
    </div>
  )
}

export default Home
