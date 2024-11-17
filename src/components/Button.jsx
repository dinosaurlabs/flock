import React from "react";
import Typography from "./TextStyles/Typography";

function Button({phrase}) {
    return (
        <div>
      <button
        className="px-8 rounded-md py-6 bg-primary"
         pr-16px
        >
          <Typography textStyle= "label-lg">{phrase}</Typography>
        </button>
        </div>
      );
      
  }

export default Button