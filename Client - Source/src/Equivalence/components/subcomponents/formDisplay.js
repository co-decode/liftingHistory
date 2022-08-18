import React from "react";

const FormDisplay = () => {
    const optionsToggle = () => {
        const options = document.getElementById("options");
        const optionsBlock = document.getElementById("optionsToggle")
        options.style.getPropertyValue('display') === 'grid' 
        ? options.style.setProperty('display','none')
        : options.style.setProperty('display','grid')
        options.style.getPropertyValue('display') === 'grid'
        ? optionsBlock.style.setProperty('box-shadow','0.5px 0.5px var(--bg)')
        : optionsBlock.style.setProperty('box-shadow','-0.5px -0.5px var(--bg)')
      }
      const highlightToggle = () => {
        const options = document.getElementById("highlightDiv");
        const optionsBlock = document.getElementById("highlightToggle")
        options.style.getPropertyValue('display') === 'grid'
        ? options.style.setProperty('display','none')
        : options.style.setProperty('display','grid')
        options.style.getPropertyValue('display') === 'grid'
        ? optionsBlock.style.setProperty('box-shadow','0.5px 0.5px var(--bg)')
        : optionsBlock.style.setProperty('box-shadow','-0.5px -0.5px var(--bg)')
      }
      const filterToggle = () => {
        const options = document.getElementById("filter");
        const optionsBlock = document.getElementById("filterToggle")
        options.style.getPropertyValue('display') === 'grid'
        ? options.style.setProperty('display','none')
        : options.style.setProperty('display','grid')
        options.style.getPropertyValue('display') === 'grid'
        ? optionsBlock.style.setProperty('box-shadow','0.5px 0.5px var(--bg)')
        : optionsBlock.style.setProperty('box-shadow','-0.5px -0.5px var(--bg)')
      }

    return (
        <div id="formDisplay">
          <div id="optionsToggle" onClick={optionsToggle}><span>O</span></div>
          <div id="highlightToggle" onClick={highlightToggle}><span>H</span></div>
          <div id="filterToggle" onClick={filterToggle}><span>F</span></div>
        </div>
    )
}

export default FormDisplay