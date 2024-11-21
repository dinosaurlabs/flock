import React from 'react'
import Typography from './TextStyles/Typography'

function Button ({ buttonSize="md", className="", color="primary", onClick, text, icon }) {
    const icons = {
        
    }

    return (
        <button className={`flex items-center rounded-md ${buttonSize} ${color} ${className}`} onClick={onClick}>
            <Typography textStyle={`label-${buttonSize}`}>{text}</Typography>{icons[icon]}
        </button>
    );
}

export default Button;