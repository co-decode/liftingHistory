import React, { useEffect, useState } from "react";

const Wrapper = () => {
  const [showCard, setShowCard] = useState(true)
  
  useEffect(() => {
    function shortcutListener(e) {
    
      if (e.shiftKey && e.code === "KeyO") {
        e.preventDefault()
        e.stopImmediatePropagation()
        const options = document.getElementById("options");
        options.style.getPropertyValue('display') === 'grid'
          ? options.style.setProperty('display', 'none')
          : options.style.setProperty('display', 'grid')
      }
      if (e.shiftKey && e.code === "KeyH") {
        e.preventDefault()
        e.stopImmediatePropagation()
        const options = document.getElementById("highlightDiv");
        options.style.getPropertyValue('display') === 'grid'
          ? options.style.setProperty('display', 'none')
          : options.style.setProperty('display', 'grid')
      }
      if (e.shiftKey && e.code === "KeyF") {
        e.preventDefault()
        e.stopImmediatePropagation()
        const options = document.getElementById("filter");
        options.style.getPropertyValue('display') === 'grid'
          ? options.style.setProperty('display', 'none')
          : options.style.setProperty('display', 'grid')
      }
      if (e.shiftKey && e.code === "KeyT") {
        e.preventDefault()
        e.stopImmediatePropagation()
        setShowCard(true)        
      }
      if (e.shiftKey && e.code === "KeyM") {
        e.preventDefault()
        document.getElementById("min").focus();
      }
    }

    document.addEventListener("keydown", shortcutListener)
    
    return () => {
      document.removeEventListener("keydown", shortcutListener)
    }
  })


  const handleRemove = () => {
    setShowCard(false)
  }

  useEffect(() => {
    const appDiv = document.getElementById("appDiv")

    if (showCard) {
      document.addEventListener("keydown", handleRemove)
      appDiv.addEventListener("mousedown", handleRemove)
    }
    return () => {
      document.removeEventListener("keydown", handleRemove)
      appDiv.removeEventListener("mousedown", handleRemove)
    }
  })


  


  return (
  <>
    <div id="wrapper" style={{visibility: showCard ? "visible" : "collapse"}}>
      <h1>Weight Equivalence Calculator</h1>
      <h4>Welcome!</h4>
      <p>Click anywhere or hit any Key to Continue</p>
      <aside>
        <br/>
        <span>Hotkeys:</span>
        <pre>Options:            shift + o</pre>
        <pre>Highlighter:        shift + h</pre>
        <pre>Filter:             shift + f</pre>
        <pre>Opening Card:       shift + t</pre>
        <pre>Focus first input:  shift + m</pre>
      </aside>
    </div>
    </>
  )
}

export default Wrapper