import React from "react";
import { ChevronsRight } from "lucide-react";
import "./Button.css";
import Typography from "../Typography/Typography";

function Button({
  text,
  icon,
  type,
  buttonSize = "md",
  className = "",
  onClick,
  color = "primary",
}) {
  // Icon dictionary
  const icons = {
    arrow: <ChevronsRight className="text-current" />,
  };

  return (
    <button
      type={type}
      className={`flex items-center justify-center rounded-full ${buttonSize} ${color} ${className}`}
      onClick={onClick}
    >
      <Typography textStyle={`label-${buttonSize}`}>{text}</Typography>
      {icons[icon]}
    </button>
  );
}

export default Button;
