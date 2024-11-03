import React from "react";
import "./TextStyles.css";

function Text({ textStyle, children, className }) {
  return <div className={`${textStyle} ${className}`}>{children}</div>;
}

export default Text;
