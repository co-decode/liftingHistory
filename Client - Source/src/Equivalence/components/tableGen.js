import React from "react";
// import FormDisplay from './subcomponents/formDisplay';


const TableGen = ({ reps, setReps, min, step, max, handleMin, handleMax, handleStep }) => {
    function repLimit (e) {
        let repsValue = Number(e.target.value)
        if (repsValue > 20) { repsValue = 20 }
        setReps(repsValue - 1)
    }

    return (
    <div id="parameters">
        <label htmlFor="min">
            Minimum:
        </label>
        <input id="min" type="number" placeholder="0" min="0" max="1000" step={step} defaultValue={min} onChange={(e) => { handleMin(e) }} />

        <label htmlFor="max">
            Maximum:
        </label>
        <input id="max" type="number" placeholder="0" min="0" max="1000" step={step} defaultValue={max} onChange={(e) => { handleMax(e) }} />

        <label htmlFor="repetitions">
            Repetitions:
        </label>
        <input id="repetitions" type="number" placeholder="0" min="1" max="20" defaultValue={reps} onChange={(e) => { repLimit(e); }} />

        <label htmlFor="step">
            Step Value:
        </label>
        <input id="step" type="number" min="1" max="1000" defaultValue={step} onChange={(e) => handleStep(e)} />

        <span>
            Current Step: {step}
        </span>
        
        {/* <FormDisplay /> */}
    </div>
    )};

export default TableGen;