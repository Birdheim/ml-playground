import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import About from './pages/About';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  // Define which routes have dark backgrounds
  const lightPages = ['/playground', '/results'];

  const isLight = lightPages.some((page) => location.pathname.startsWith(page));

  return (
    <>
      <Navbar isLight={isLight} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
