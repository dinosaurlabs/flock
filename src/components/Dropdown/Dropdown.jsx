import React, {useState} from 'react';
import Typography from "../TextStyles/Typography";

function Dropdown({title, content }) {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(prevState => !prevState);
    }
  
    return (
      <div className="dropdown">
        <button 
          className="dropdown-toggle w-full" 
          onClick={toggleDropdown}>
          <Typography textStyle={"title-sm"} color={"onSurface"}>
            <div className='dropdown-title flex justify-between'>
              <span>{title}</span> 
              <span style={{marginLeft: '10px'}}>{isOpen? '-' : '+'}</span> 
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