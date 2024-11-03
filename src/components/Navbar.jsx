import React from "react";
import LogoFull from "./SVGs/logos/FlockLogo";
import { Link } from "react-router-dom";
import Typography from "../components/Typography/Typography";

function Navbar() {
  // Manu and Toni
  return (
    <nav className="fixed z-10 flex border-b-border bg-surface-light dark:bg-surface-dark dark:border-b-border-dark border-b-[1px] items-center justify-between w-full px-6 py-6">
      {/* TODO: Route in the future */}
      <LogoFull />

      <Link>
        <Typography textStyle={"label-lg"} color="secondary">
          Create a Flock
        </Typography>
      </Link>
    </nav>
  );
}

export default Navbar;
