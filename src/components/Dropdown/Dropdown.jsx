import React, { useState } from "react";
import Typography from "../TextStyles/Typography";
// import "./Dropdown.css"

function Dropdown({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const PLUS_ICON = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const MINUS_ICON = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="dropdown">
      <button className="dropdown-toggle w-full" onClick={toggleDropdown}>
        <Typography textStyle={"title-sm"} color={"onSurface"} as="div">
          <div className="dropdown-title flex justify-between">
            <span>{title}</span>
            <span style={{ marginLeft: "10px" }}>
              {isOpen ? MINUS_ICON : PLUS_ICON}
            </span>
          </div>
        </Typography>
      </button>
      {isOpen && (
        <div className="dropdown-content">
          <Typography textStyle={"body-lg"} color={"secondary"}>
            {content}
          </Typography>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
