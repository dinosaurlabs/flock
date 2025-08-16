import React, { useState } from "react";
import LogoFull from "./SVGs/logos/FlockLogo";
import { Link } from "react-router-dom";
import Button from "../components/Button/Button";

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinFlock = async () => {
    if (accessCode.length === 5) {
      const code = accessCode.toUpperCase();
      const { convex } = await import('../convexClient');
      const { api } = await import('../convex/_generated/api');
      const event = await convex.query(api.events.getEventByAccessCode, { accessCode: code });
      if (event) {
        window.location.href = `/event/${event._id}`;
      } else {
        setError('Invalid access code');
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setAccessCode("");
    setError("");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full px-20 py-6">
        <Link to="/" className="relative z-50">
          <LogoFull />
        </Link>
        <div className="flex items-center gap-3 relative z-50">
          <Button 
            text="Join Flock" 
            buttonSize="md" 
            color="primary"
            onClick={() => setShowModal(true)}
          />
          <Link to="/signup">
            <Button text="Sign Up" buttonSize="md" color="onSurface" />
          </Link>
        </div>
      </nav>

      {/* Figma-based Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
          onClick={closeModal}
        >
          <div 
            className="bg-[#fcfeff] flex flex-col gap-6 items-center justify-center p-9 rounded-lg shadow-2xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[20px] font-extrabold text-[#008dde]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Enter Flock Code
            </div>
            
            <div className="bg-[#f5f8fa] rounded-md w-full relative">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase().slice(0, 5));
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && accessCode.length === 5) handleJoinFlock();
                  if (e.key === 'Escape') closeModal();
                }}
                placeholder="XXXXX"
                className="w-full p-[14px] bg-transparent text-[14px] text-[#1b1b1b] placeholder-gray-400 focus:outline-none uppercase text-center tracking-widest font-medium"
                style={{ fontFamily: 'Cabin, sans-serif' }}
                maxLength="5"
                autoFocus
              />
              <div className="absolute border border-[#d2d2d2] inset-0 pointer-events-none rounded-md" />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm -mt-4">{error}</p>
            )}
            
            <button
              onClick={handleJoinFlock}
              disabled={accessCode.length !== 5}
              className={`w-full px-4 py-3 rounded-md font-bold text-[16px] transition-all ${
                accessCode.length === 5 
                  ? 'bg-[#008dde] text-white hover:bg-[#0077c2]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              JOIN YOUR FLOCK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
