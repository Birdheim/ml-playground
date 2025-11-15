import { useEffect, useState } from 'react'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
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
      <div className='App'> 
        <h1>
          ML Playground
        </h1>

        {error ? (
          <p style={{color: 'red'}}>Error: {error}</p>
        ): (
          <>
            <p style={{color: 'green'}}>Backend message: {message}</p>
            <p>Backend works</p>
          </>
        )}


        <ThemeToggle />
      </div>
    </>
  )
}

export default App
