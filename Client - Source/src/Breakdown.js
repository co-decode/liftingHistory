import React from "react";

export default function Breakdown({get, edit}) {
    const session = get.date.filter(v=> v.sid === edit)[0]
    return (
        <>
            {/* {JSON.stringify(get)}
            {JSON.stringify(get.date.filter(v=>v.sid === edit))}
            {JSON.stringify(get.deadlift.filter(v=>v.sid === edit))} */}
            <div>
                {new Date(session.date).toLocaleString()}
                {session.exercises.map(exercise => {
                    const {mass, reps, variation} = get[exercise].filter(v => v.sid === edit)[0]
                    console.log(mass, reps, variation)
                    const totalReps = reps.reduce((a,v)=> a+v)
                    const tonnage = mass.reduce((a,v,i)=>a + v * reps[i])
                    return (
                        <div key={`${exercise}`}>
                            {exercise[0].toUpperCase() + exercise.slice(1)}{`: `}<br/>
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
                                    <div>
                                        Set {set+1}: {weight} kg | {reps[set]} rep{reps[set] > 1 ? `s` : null} <br/>
                                    </div>
                                )
                            })}

                        </div>
                    )
                })
                }
            </div>
        </>
    )
}