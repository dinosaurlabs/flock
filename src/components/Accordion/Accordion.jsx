import React, { useState } from "react";
import Typography from "../Typography/Typography";

function Accordion({ items }) {
  const [active, setActive] = useState([]);
  const onClick = (index) => {
    if (active.includes(index)) {
      setActive(active.filter((item) => item !== index));
    } else {
      setActive([...active, index]);
    }
  };
  // items = [{question: 'title', answer: 'content'}]

  return items.map((item, i) => {
    return (
      <AccordionItem
        active={active.includes(i)}
        onClick={onClick}
        index={i}
        item={item}
      />
    );
  });
}

function AccordionItem({ active, onClick, index, item }) {
  // active Boolean
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <Typography textStyle="body-lg">{item.question}</Typography>
        {active ? (
          <button className="transition" onClick={() => onClick(index)}>
            <b>–</b>
          </button>
        ) : (
          <button className="transition-opacity" onClick={() => onClick(index)}>
            <b>+</b>
          </button>
        )}
      </div>
      {active && (
        <Typography textStyle="body-lg" color="secondary">
          {item.answer}
        </Typography>
      )}
      <div className="pb-4">
        <hr></hr>
      </div>
    </div>
  );
}

export default Accordion;
