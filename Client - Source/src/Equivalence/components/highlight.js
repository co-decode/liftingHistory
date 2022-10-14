import React from "react";

const Highlight = ({target,setTarget,bin,setBin}) => (
    <div className="calc_highlight_outer">
    <div id="highlightDiv">
        <label htmlFor="highlight">
            Highlight:
        </label>
        <input id="highlight" type="number" min="0" max="1000" value={target} onChange={(e) => { setTarget(Number(e.target.value)); }} />
        <label htmlFor="highlightRange">
            Highlight Range:
        </label>
        <input id="highlightRange" type="number" min="0" max="10" value={bin} onChange={(e) => { setBin(Number(e.target.value)); }} />
    </div>
    </div>
);

export default Highlight;