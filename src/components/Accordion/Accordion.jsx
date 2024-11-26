import React, { useState } from "react";
import Typography from "../Typography/Typography";

function Accordion({ items }) {
  const [active, setActive] = useState(null);
  const onClick = (index) => {
    setActive(index);
  };
  // items = [{question: 'title', answer: 'content'}]

  return items.map((item, i) => {
    console.log(item);
    return (
      <div className="w-max">
        <AccordionItem
          active={active === i}
          onClick={onClick}
          index={i}
          item={item}
        />
        <hr></hr>
      </div>
    );
  });
}

function AccordionItem({ active, onClick, index, item }) {
  // active Boolean
  return (
    <div className="flex flex-col w-max">
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
      <hr></hr>
    </div>
  );
}

export default Accordion;
