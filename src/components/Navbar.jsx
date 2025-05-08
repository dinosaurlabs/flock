import React from "react";
import LogoFull from "./SVGs/logos/FlockLogo";
import { Link } from "react-router-dom";
import Button from "../components/Button/Button";

function Navbar() {
  // Manu and Toni
  return (
    <nav className="fixed z-10 flex items-center justify-between w-full px-20 py-6 ">
      <Link to="/">
        <LogoFull />
      </Link>
      <Link to="/create">
        <Button text="Sign Up" buttonSize="md" color="onSurface" />
      </Link>
    </nav>
  );
}

export default Navbar;
