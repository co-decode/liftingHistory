import React from "react"

const Restore = () => {
    function restoreAll(e) {
        e.preventDefault();
        document.querySelectorAll(`th[data-col]`).forEach(val => {
          val.style.setProperty('display','table-cell')});
        document.querySelectorAll(`td[data-col]`).forEach(val => {
          val.style.setProperty('display','table-cell')});
        document.querySelectorAll(`tr[data-row]`).forEach(val => {
          val.style.setProperty('display','table-row')}) ;  
      }

    return (
<div id="restoreAll">
    <button onClick={e=> restoreAll(e)}>
        Restore Table
    </button>
</div>
    )};

export default Restore;