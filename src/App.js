// App.js
import "./App.css";
import Home from "./pages/Home.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/Navbar.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
        <NavBar />
        <Routes>
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
