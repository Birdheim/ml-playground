import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from "react";
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Playground from './pages/Playground';
import WeAreUnpacking from './pages/WeAreUnpacking';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  // Define which routes have dark backgrounds
  const lightPages = ['/playground', '/learn', '/about'];

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
        <Route path="/playground" element={<Playground />} />
        <Route path="/learn" element={<WeAreUnpacking />} />
        <Route path="/about" element={<WeAreUnpacking />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
