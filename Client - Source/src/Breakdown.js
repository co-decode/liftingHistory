import React, { useEffect, useState } from "react";

export default function Breakdown({get, edit, setEdit, setPage, setGoToMonthYear}) {
    const session = get.date.find(v=> v.sid === edit)
    const [show, setShow] = useState(session.exercises)
    useEffect(() => {
        setGoToMonthYear(new Date(session.date))        
    },[session, setGoToMonthYear])
    return (
        <div>
            <button onClick={()=>{setPage("EDIT")}}>Edit this Session</button>
            <button onClick={()=>{setEdit(0); setPage("LOG")}}>Return to Log at Position</button>
            <button onClick={()=>{setEdit(0); setPage("CALENDAR")}}>Return to Calendar at Month</button>
            <br/>
            {new Date(session.date).toLocaleString()}
            <fieldset style={{display:"inline-block"}}>
                {session.exercises.map(exercise => {
                    return (
                        <div style={{display: "inline-block"}} key={`${exercise}Toggle`}>
                            <label htmlFor={`${exercise}Toggle`}>{exercise[0].toUpperCase() + exercise.slice(1)}</label>
                            <input type="checkbox" id={`${exercise}Toggle`} defaultChecked onChange={(e)=> e.target.checked ? setShow([...show, exercise]) : setShow([...show].filter(v=>v !== exercise)) }/>
                        </div>
                    )
                })}
            </fieldset>
            {show.map(exercise => {
                const {mass, reps, variation} = get[exercise].filter(v => v.sid === edit)[0]
                const totalReps = reps.reduce((a,v)=> a+v)
                const tonnage = mass.reduce((a,v,i)=>a + v * reps[i], 0)
                return (
                    <div key={`${exercise}`}>
                    <strong>{exercise[0].toUpperCase() + exercise.slice(1)}{`: `}</strong> <br/>
                        Max: {mass.reduce((a,v)=> Math.max(a,v))} kg
                        {` | `}
                        Total Reps: {totalReps}
                        {` | `}
                        {`Tonnage: `}{tonnage} kg <br/>
                        {`Average Mass: `}{(tonnage / totalReps).toFixed(1)} kg / r
                        {` | `}
                        {`Average Reps: `}
                        {(totalReps / reps.length).toFixed(2)} r / s
                        {mass.map((weight, set) => {
                            return (
                                <div key={`${exercise}Set${set}`}>
                                    Set {set+1}: {weight} kg | {reps[set]} rep{reps[set] > 1 ? `s` : null} <br/>
                                </div>
                            )
                        })}
                        Variation: {variation.map((v,i,a)=><strong key={`variation${i}`}>{v}{i < a.length - 1 ? ` | `: null}</strong>)}
                        <hr/>
                    </div>
                )
            })
            }
        </div>
    )
}