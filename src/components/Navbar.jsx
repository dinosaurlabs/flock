import React from "react";
import LogoIcon from "./SVGs/logos/FlockIcon";
import LogoFull from "./SVGs/logos/FlockLogo";
import { Link } from "react-router-dom";

function Navbar() {
  // Manu and Toni
  return (
    <nav className="fixed z-10 flex border-b-border dark:border-b-border-dark border-b-[1px] items-center justify-between w-full px-6 py-4">
      {/* TODO: Route in the future */}
      <LogoFull />

      <Link className="font-bold text-secondary dark:text-secondary-dark font-display">
        CREATE A FLOCK
      </Link>
    </nav>
  );
}

export default Navbar;
