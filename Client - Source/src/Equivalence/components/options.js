import React from "react";
import Reverser from './subcomponents/reverser';
import PeekLbs from  './subcomponents/peekUnit';
import Invert from   './subcomponents/calcInvert';
import TableToggle from './subcomponents/tableToggle';

const Options = ({step,reps,repMax, unit,setUnit,setRepMax,min,max,setReverse,setTableToggle,tableToggle}) => {

    return (
        <div className="calc_options_outer">
        <div id="options">
            <PeekLbs min={min} max={max} step={step} reps={reps} repMax={repMax} unit={unit} setUnit={setUnit} />
            <Invert setRepMax={setRepMax} repMax={repMax} />
            <Reverser setReverse={setReverse} />
            <TableToggle setTableToggle={setTableToggle} tableToggle={tableToggle} />
        </div>
        </div>
    )
}

export default Options