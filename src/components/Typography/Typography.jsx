import React from "react";
import "./TextStyles.css";

function Typography({ textStyle, children, color = "onSurface" }) {
  const colorClass = `text-${color}-light dark:text-${color}-dark`;

  return <p className={`${textStyle}  ${colorClass}`}>{children}</p>;
}

export default Typography;
