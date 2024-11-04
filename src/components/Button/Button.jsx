import React from "react";
import { TbChevronsRight } from "react-icons/tb";
import "./Button.css";
import Typography from "../Typography/Typography";

function Button({
  text,
  icon,
  buttonSize = "md",
  className = "",
  onClick,
  color = "primary",
}) {
  // Icon dictionary
  const icons = {
    arrow: <TbChevronsRight className="text-current" />,
  };

  return (
    <button
      className={`flex items-center rounded-md ${buttonSize} ${color} ${className}`}
      onClick={onClick}
    >
      <Typography textStyle={`label-${buttonSize}`}>{text}</Typography>
      {icons[icon]}
    </button>
  );
}

export default Button;
