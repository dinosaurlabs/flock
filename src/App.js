// App.js
import "./App.css";
import Home from "./pages/Home.jsx";
import CreateFlock from "./pages/CreateFlock.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import EventPageConvex from "./pages/EventPageConvex.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/Navbar.jsx";
import Signup from "./pages/Signup.jsx";
import { ConvexProvider } from "./convexClient";
import { convex } from "./convexClient";

function App() {
  // Check if we should use Convex or Supabase
  const useConvex = process.env.REACT_APP_USE_CONVEX === 'true';

  return (
    <ConvexProvider client={convex}>
      <Router>
        <main className="text-black bg-surface dark:bg-surface-dark dark:text-white">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateFlock />} />
            <Route path="/ai-planner" element={<ChatbotPage />} />
            <Route path="/event/:id" element={useConvex ? <EventPageConvex /> : <EventPage />} />
            <Route path="signup" element={<Signup />} />
          </Routes>
        </main>
      </Router>
    </ConvexProvider>
  );
}

export default App;
