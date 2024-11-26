import React, { useState } from "react";
import Typography from "../Typography/Typography";

function Accordion({ items }) {
  const [active, setActive] = useState(null);
  const onClick = (index) => {
    setActive(index);
  };
  // items = [{question: 'title', answer: 'content'}]

  return items.map((item, i) => {
    return (
      <div className="">
        <AccordionItem
          active={active === i}
          onClick={onClick}
          index={i}
          item={item}
        />
      </div>
    );
  });
}

function AccordionItem({ active, onClick, index, item }) {
  // active Boolean
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between">
        <Typography textStyle="body-lg">{item.question}</Typography>
        {active ? (
          <button onClick={() => onClick(null)}>-</button>
        ) : (
          <button onClick={() => onClick(index)}>+</button>
        )}
      </div>
      {active && (
        <Typography textStyle="body-lg" color="secondary">
          {item.answer}
        </Typography>
      )}
      <div className="h-3">
        <hr className="bold"></hr>
      </div>
    </div>
  );
}

export default Accordion;
