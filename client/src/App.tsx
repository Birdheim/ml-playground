import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect } from "react";
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Playground from './pages/Playground';
import PlaygroundLayout from './pages/Playground/PlaygroundLayout';
import Experiment from './pages/Playground/Experiment';
import WeAreUnpacking from './pages/WeAreUnpacking';
import Footer from './components/Footer';
import './App.css';

function App() {
  const location = useLocation();
  // Define which routes have dark backgrounds
  const lightPages = ['/playground', '/learn', '/about'];

  const isLight = lightPages.some((page) => location.pathname.startsWith(page));

  // Everything under /playground is one section sharing one layout.
  const section = location.pathname.startsWith('/playground') ? '/playground' : location.pathname;

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
      {/*
        Keyed so each route fades in rather than swapping hard — but keyed on
        the *section*, not the exact path. Keying on the path remounted the
        whole playground when you opened a question, which took Eve down with
        it and made her blink. Inside /playground she now stays put and only
        the column beside her changes.
      */}
      <main className="app-main page-enter" key={section}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<PlaygroundLayout />}>
            <Route path="/playground" element={<Playground />} />
            <Route path="/playground/:name" element={<Experiment />} />
          </Route>
          <Route path="/learn" element={<WeAreUnpacking />} />
          <Route path="/about" element={<WeAreUnpacking />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
