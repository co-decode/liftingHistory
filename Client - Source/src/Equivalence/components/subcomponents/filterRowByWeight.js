import React from "react";

const FilterRow = ({min,max}) => {
    function rowFilterByWeight(e) {
        e.preventDefault() 
        let weight = document.getElementById("filterRowByWeight").value;
        document.querySelectorAll(`tr[data-weight="${weight}"]`).forEach(val => {
          val.style.getPropertyValue("display") === "none" ? val.style.setProperty('display','table-row') : val.style.setProperty('display','none')
        }); 
    }

    return(
    <div id="filterRowDiv">
        <label htmlFor="filterRowByWeight">Weight to Filter:</label>
        <input id="filterRowByWeight" placeholder="0" type="number" min={min} max={max} />
        <button onClick={e=> rowFilterByWeight(e)}>Toggle Row</button>
    </div>
)}

export default FilterRow;