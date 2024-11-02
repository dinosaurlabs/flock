// App.js
import "./App.css";
import Home from "./pages/home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#1f2125";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#FCFCFC";
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
