import React, { useState, useRef } from "react";
import returnTonnage from "./utils/tonnageFunctions";


export default function Tonnage({get}) {
    // const [format, setFormat] = useState(null)
    const [interval, setInterval] = useState(null)
    const [intervalLength, setIntervalLength] = useState([null, null])
    const [referenceDate, setReferenceDate] = useState(null)
    const customInput = useRef()
    return(
        <>
        <fieldset>
           {/*  <label htmlFor="tonnageFormat">Tonnage Format</label>
            <select id="tonnageFormat" onChange={(e)=>setFormat(e.target.value)}>
                <option value="">___</option>
                <option value={"REPS"}>reps</option>
                <option value={"MASS"}>mass</option>
            </select> */}
            <label htmlFor="tonnageInterval">Interval</label>
            <select id="tonnageInterval" ref={customInput} onChange={(e)=>setInterval(e.target.value)}>
                <option value="">___</option>
                <option value="SESSION">session</option>
                <option value="WEEK">week</option>
                <option value="MONTH">month</option>
                <option value="ALL">all</option>
                <option value="CUSTOM">custom</option>
            </select>
            {interval === "CUSTOM" &&
            <>
                <label htmlFor={`IntervalLength`}>Interval Length</label>
                <input id={`IntervalLength`} onChange={(e)=> intervalLength[1] === "WEEKS" ? setIntervalLength([parseInt(e.target.value) * 7, intervalLength[1]]) : setIntervalLength([parseInt(e.target.value), intervalLength[1]])}/>
                <label htmlFor={`intervalLengthIn...`}>in...</label>
                <select id={`intervalLengthIn...`} onChange={(e)=> setIntervalLength([intervalLength[0], e.target.value])}>
                    <option value=""> --- </option>
                    <option value="DAYS">DAYS</option>
                    <option value="WEEKS">WEEKS</option>
                </select>
                <label htmlFor={`BeginReferenceDate`}>Beginning Reference Date</label>
                <input id={`BeginReferenceDate`} type="date" onChange={(e)=> setReferenceDate(e.target.value)}/>
            </>}
        </fieldset>
        {returnTonnage(get, /* format, */ interval || "ALL", intervalLength[0] || 7, referenceDate)}
        </>
    )
}