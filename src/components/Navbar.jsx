import React from "react";
import LogoFull from "./SVGs/logos/FlockLogo";
import { Link } from "react-router-dom";
import Button from "../components/Button/Button";

function Navbar() {
  // Manu and Toni
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full px-20 py-6">
      <Link to="/" className="relative z-50">
        <LogoFull />
      </Link>
      <Link to="/signup" className="relative z-50">
        <Button text="Sign Up" buttonSize="md" color="onSurface" />
      </Link>
    </nav>
  );
}

export default Navbar;
