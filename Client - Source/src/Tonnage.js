import React, { useState, useRef } from "react";
import returnTonnage from "./utils/tonnageFunctions";


export default function Tonnage({get}) {
    const [format, setFormat] = useState(null)
    const [interval, setInterval] = useState(null)
    const customInput = useRef()
    return(
        <>
        <button onClick={()=> console.log(format, interval)}>log</button>
        <fieldset>
            <label htmlFor="tonnageFormat">Tonnage Format</label>
            <select id="tonnageFormat" onChange={(e)=>setFormat(e.target.value)}>
                <option value="">___</option>
                <option value={"REPS"}>reps</option>
                <option value={"MASS"}>mass</option>
            </select>
            <label htmlFor="tonnageInterval">Interval</label>
            <select id="tonnageInterval" ref={customInput} onChange={(e)=>setInterval(e.target.value)}>
                <option value="">___</option>
                <option value="SESSION">session</option>
                <option value="WEEK">week</option>
                <option value="MONTH">month</option>
                <option value="ALL">all</option>
                <option value="CUSTOM">custom</option>
            </select>
            {customInput.current?.value === "CUSTOM" &&
            <>
                <label>Interval Length</label>
                <input />
                <label>Beginning Reference Date</label>
                <input />
            </>}
        </fieldset>
        {returnTonnage(get, format, interval)}
        </>
    )
}