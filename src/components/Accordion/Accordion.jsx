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
        key={i}
        active={active.includes(i)}
        onClick={onClick}
        index={i}
        item={item}
      />
    );
  });
}

function AccordionItem({ active, onClick, index, item }) {
  return (
    <div
      className={`flex flex-col gap-5 cursor-pointer`}
      onClick={() => onClick(index)} // Make the whole item clickable
    >
      <div className="flex flex-row justify-between">
        <Typography textStyle="body-lg">{item.question}</Typography>
        {active ? (
          <b className="transition">–</b>
        ) : (
          <b className="transition-opacity">+</b>
        )}
      </div>
      {active && (
        <Typography textStyle="body-lg" color="secondary">
          {item.answer}
        </Typography>
      )}
      <div className="pb-4">
        <hr />
      </div>
    </div>
  );
}

export default Accordion;
