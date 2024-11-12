import React, {useState} from 'react';
import Typography from "../components/TextStyles/Typography";

function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
      
    }
  
    return (
      <div className="dropdown">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <Typography textStyle={"title-sm"} color={"onSurface"}>
            How do I create a meeting?
          </Typography>
        </button>
        {isOpen && (
          <ul className="dropdown-menu">
            <li>Will answer later</li> 
          </ul>
        )}
      </div>
    )
  }

export default Dropdown;