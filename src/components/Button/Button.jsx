import React from "react";
import { TbChevronsRight } from "react-icons/tb";
import "./Button.css";

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
      <span>{text}</span>
      {icons[icon]}
    </button>
  );
}

export default Button;
