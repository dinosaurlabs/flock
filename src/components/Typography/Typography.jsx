import React from "react";
import "./TextStyles.css";

function Typography({ textStyle, children, color, as = "span" }) {
  const Component = as;
  return (
    <Component className={`${textStyle} text-${color}`}>{children}</Component>
  );
}

export default Typography;
