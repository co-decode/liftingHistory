import React from "react";

const FilterCol = ({reps}) => {
    function colFilter(e) {
        e.preventDefault();
        let x = document.getElementById("filterCol").value;
        document.querySelectorAll(`th[data-col="${x-2}"]`).forEach(val => {
          val.style.getPropertyValue("display") === "none" ? val.style.setProperty('display','table-cell') : val.style.setProperty('display','none')});
        document.querySelectorAll(`td[data-col="${x-2}"]`).forEach(val => {
          val.style.getPropertyValue("display") === "none" ? val.style.setProperty('display','table-cell') : val.style.setProperty('display','none')});
      }

    return (
    <div id="filterColDiv">
        <label htmlFor="filterCol">Reps to Filter:</label>
        <input id="filterCol" placeholder="0" type="number" min="2" max={reps} />
        <button onClick={e=> colFilter(e)}>Toggle Column</button>
    </div>
)}

export default FilterCol;