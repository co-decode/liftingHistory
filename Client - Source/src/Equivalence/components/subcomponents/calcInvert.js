import React from "react";

const Invert = ({repMax,setRepMax}) => {
    
    const handleRepMax = e => {
        e.preventDefault();
        repMax ? setRepMax(false) : setRepMax(true);
      }

    return(
    <button id="inverter" onClick={(e) => handleRepMax(e)}>
        {repMax ? "Weight: On the Bar" : "Weight: Equivalent"}
    </button>
)}

export default Invert;