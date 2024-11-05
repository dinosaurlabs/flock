import React from "react";
import "./TextStyles.css";

function Typography({ textStyle, children, color }) {
  return <p className={`${textStyle}  text-${color}`}>{children}</p>;
}

export default Typography;
