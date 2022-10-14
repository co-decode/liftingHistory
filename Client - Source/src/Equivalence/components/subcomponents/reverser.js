import React from "react";

const Reverser = ({setReverse}) => {
    
    return(
    <div id="reverserDiv">
        <label htmlFor="reverser">Reverse Order&nbsp;
        <input id="reverser" type="checkbox" onChange={(e) => setReverse(e.target.checked)} />
        </label>
    </div>
)}

export default Reverser;