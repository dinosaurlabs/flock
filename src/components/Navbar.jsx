import React from "react";
import Typography from "../components/TextStyles/Typography";
import FlockLogo from "../components/SVGs/logos/FlockLogo"

function Navbar() {
  
    return (<nav className="px-4 pb-3 pt-5 fixed w-full" style={{ borderBottom: "1px inset solid grey"}}>
        
        <div className="flex pt-3 justify-between" style={{} }>
            <FlockLogo />
            <Typography textStyle="" color="secondary">CREATE A FLOCK</Typography>
        </div>
    </nav>);
}

export default Navbar;
