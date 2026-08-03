import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect } from "react";
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Playground from './pages/Playground';
import Experiment from './pages/Playground/Experiment';
import WeAreUnpacking from './pages/WeAreUnpacking';
import Footer from './components/Footer';
import './App.css';

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

  // BrowserRouter keeps the scroll position across navigations, so scrolling
  // down the landing page and clicking through left you part-way down the next
  // one — which is most of what "everything jumps around" was. Instant rather
  // than smooth: an animated scroll on navigation just delays the new page.
  // useLayoutEffect so it lands before the browser paints, and keyed on
  // pathname only, so moving between stages inside an experiment (which does
  // not change the URL) keeps the position it deliberately scrolled to.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar isLight={isLight} />
      {/* keyed on the path so each route fades in rather than swapping hard */}
      <main className="app-main page-enter" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/playground/:name" element={<Experiment />} />
          <Route path="/learn" element={<WeAreUnpacking />} />
          <Route path="/about" element={<WeAreUnpacking />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
