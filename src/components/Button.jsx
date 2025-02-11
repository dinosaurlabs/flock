
import React from "react";
import Typography from "./TextStyles/Typography";

function Button({ phrase }) {
  return (
    <div>
      <button className="px-4 py-3 rounded-md bg-primary" pr-16px>
        <Typography textStyle="label-lg">{phrase}</Typography>
      </button>
    </div>
  );
}

export default Button;