import React from "react";

const Reverser = ({setReverse}) => {
    
    return(
    <div id="reverserDiv">
        <label htmlFor="reverser">Reverse Order</label>
        <input id="reverser" type="checkbox" onChange={(e) => setReverse(e.target.checked)} />
    </div>
)}

export default Reverser;