import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from "react";
import Home from './pages/Home';
import Navbar from './components/Navbar';
import About from './pages/About';
import Playground from './pages/Playground';
import Resources from './pages/Resources';
import WeAreUnpacking from './pages/WeAreUnpacking';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  // Define which routes have dark backgrounds
  const lightPages = ['/playground', '/results'];

  const isLight = lightPages.some((page) => location.pathname.startsWith(page));

  useEffect(() => {
    if (location.pathname === "/") {
      document.body.classList.add("landing");
    } else {
      document.body.classList.remove("landing");
    }
  }, [location.pathname]);

  return (
    <>
      <Navbar isLight={isLight} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Resources" element={<Resources />} />
        <Route path="/Playground" element={<WeAreUnpacking />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
