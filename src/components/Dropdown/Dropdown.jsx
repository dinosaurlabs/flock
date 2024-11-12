import React, {useState} from 'react';
import Typography from "../TextStyles/Typography";

function Dropdown({title, content }) {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(prevState => !prevState);
    }
  
    return (
      <div className="dropdown">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <Typography textStyle={"title-sm"} color={"onSurface"}>
            {title}
          </Typography>
        </button>
        {isOpen && (
          <div className="dropdown-content">
            {content}
         </div>
        )}
      </div>
    )
  }

export default Dropdown;