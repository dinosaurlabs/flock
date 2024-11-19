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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{title}</span>
              <span>{isOpen? '-' : '+'}</span> 
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
    )
  }

export default Dropdown;