import React from "react";

function Photo({source, alternate}) {
    return (
        <div>
        <img className = "image-shadow rounded-xl" src = {source} alt = {alternate} height = "375" width = "275" />

        </div>
    )
}

export default Photo