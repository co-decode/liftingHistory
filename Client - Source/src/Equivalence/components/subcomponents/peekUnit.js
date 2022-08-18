import React, {useEffect} from "react";

const PeekLbs = ({ reps, step, max, min, repMax, unit, setUnit}) => {

    const unitToggleLbs = (e) => {
        e.preventDefault();
        
        unit === "null" ? setUnit("lbs") : setUnit("null");
        unit === "null" ? document.getElementById("toKg").setAttribute('disabled','disabled') : document.getElementById("toKg").disabled = false;
    }

    const unitToggleKg = (e) => {
        e.preventDefault();
        
        unit === "null" ? setUnit("kg") : setUnit("null");
        unit === "null" ? document.getElementById("toLbs").setAttribute('disabled','disabled') : document.getElementById("toLbs").disabled = false;
    }

    

    useEffect(() => {
        setUnit("null")
        document.getElementById("toKg").disabled = false;
        document.getElementById("toLbs").disabled = false;
    }, [reps, step, max, min, repMax, setUnit])

    return (
        <div id="convert">
            <button id="toLbs" onClick={e => unitToggleLbs(e)}>{unit === "null" || unit === "kg" ? `Convert to lbs` : `Back to kg`}</button>
            <button id="toKg" onClick={e => unitToggleKg(e)}>{unit === "null" || unit === "lbs" ? `Convert to kg` : `Back to lbs`}</button>
        </div>
    )
}

export default PeekLbs