import React from "react";

const ToggleTable = ({setTableToggle, tableToggle}) => {
    const handleTableToggle = (e) => {
        e.preventDefault();
        const table = document.getElementById('table');
        if (tableToggle === false) {
          table.style.setProperty("display", "table");
          setTableToggle(true);
        }
        else {
          table.style.setProperty("display", "none");
          setTableToggle(false);
        }
      }

    return(
    <button id="buTT" onClick={(e) => handleTableToggle(e)}>
        Toggle Table
    </button>
)}

export default ToggleTable;