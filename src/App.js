// App.js
import "./App.css";
import Home from "./pages/Home.jsx";
import CreateFlock from "./pages/CreateFlock.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/Navbar.jsx";

function App() {
  return (
    <Router>
      <main className="text-black bg-surface dark:bg-surface-dark dark:text-white">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateFlock />} />
          <Route path="/ai-planner" element={<ChatbotPage />} />
          <Route path="/event/:id" element={<EventPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
