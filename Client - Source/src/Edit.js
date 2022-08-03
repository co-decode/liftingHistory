import React, { useEffect, useState } from "react";
import axios from "axios";

function variationOptions(exercise, existing) {
    const dl = ['Conventional', 'Sumo']
    const sq = ['High Bar', 'Front', 'Low Bar']
    const b = ['Standard', 'Close Grip', 'Wide Grip']
    switch (exercise) {
        case 'deadlift':
            return (<>{dl.filter(v => v !== existing).map(v=><option key={`dl${v}`}>{v}</option>)}</>)
        case 'squat':
            return (<>{sq.filter(v => v !== existing).map(v=><option key={`sq${v}`}>{v}</option>)}</>)
        case 'bench':
            return (<>{b.filter(v => v !== existing).map(v=><option key={`b${v}`}>{v}</option>)}</>)
        default: return;
    }
}

export default function Edit({get, setGet, edit, setEdit, user, setDateFilter}) {
    
    const [update, setUpdate] = useState(null)
    const [feedback, setFeedback] = useState(null)
    
    useEffect(() => {
        const session = get.date.filter(v=>v.sid === edit)[0]
        const updateObject =  { 
            lifts: {},
            newLifts: {},
            lostLifts: [],
            date: session.date
        }
        session.exercises.forEach(v=>{
            const filtered = get[v].filter(v=>v.sid === edit)[0]
            updateObject.lifts[v] = {
            mass: filtered.mass, reps: filtered.reps, sets: filtered.sets, scheme: filtered.scheme, variation: filtered.variation
        }})
        setUpdate(updateObject)
    },[get, edit])

    useEffect(() => {
        setFeedback(null)
    }, [update])
    
    function returnSid(get, sidList) {
        return (
            <div>
                {sidList.map(sidVal => {
                    let exerciseCall = get.date.filter(v => v.sid === sidVal)[0].exercises;
                    let time = new Date(new Date(get.date.filter(v => v.sid === sidVal)[0].date).setTime(new Date(get.date.filter(v => v.sid === sidVal)[0].date).getTime() + 9 * 60 * 1000 * 60 + 30 * 60 * 1000)).toISOString()
                    return (
                        <div key={sidVal}>
                            <>
                            <label htmlFor="date">Date of Session</label>
                            <input id="date" type="date" defaultValue={time.slice(0,10)} 
                                onChange={(e)=>setUpdate({...update, date: e.target.value + update.date.slice(10)})}/>
                            <input type="time" defaultValue={time.slice(11,19)} 
                                onChange={(e)=>setUpdate({...update, date: update.date.slice(0,11) + e.target.value})}/>
                            </>
                            {/* <button onClick={()=>setEdit(true)}>Edit this session</button> */}
                            {exerciseCall.map(v => {
                                const filtered = get[v].filter(v => v.sid === sidVal)[0]
                                return (
                                    <div key={v}>
                                        <button onClick={() => loseLift(v)}>{update?.lostLifts.includes(v) ? 'Re-introduce ' : 'Remove ' }{v[0].toUpperCase() + v.slice(1)}</button> <br/>
                                        {v[0].toUpperCase() + v.slice(1)}:
                                        {update?.lostLifts.includes(v) ? null :
                                        <>
                                        <div>
                                            <label htmlFor={`${v}mass`}>Mass:</label> 
                                            <input id={`${v}mass`} onChange={(e)=>{
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], mass: parseFloat(e.target.value)}}})
                                            }} defaultValue={filtered.mass} />
                                        </div>
                                        <div>
                                        <label htmlFor={`${v}reps`}>Reps:</label> 
                                            <input id={`${v}reps`} onChange={(e)=>{
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], reps: parseInt(e.target.value)}}})
                                            }} defaultValue={filtered.reps} />
                                        </div>
                                        <div>
                                        <label htmlFor={`${v}sets`}>Sets:</label> 
                                            <input id={`${v}sets`} onChange={(e)=>{
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], sets: parseInt(e.target.value)}}})
                                            }} defaultValue={filtered.sets} />
                                        </div>
                                        <div>
                                            <label htmlFor={`${v}scheme`}>Scheme:</label>
                                            <select id={`${v}scheme`} onChange={(e)=>{
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], scheme: e.target.value}}})
                                            }} defaultValue={filtered.scheme}>
                                                <option>{filtered.scheme}</option>
                                                <option>Pyramid</option>
                                                <option>Linear</option>
                                            </select>
                                        </div>
                                        <div>
                                        <label htmlFor={`${v}variation`}>Variation:</label>
                                            <select id={`${v}variation`} onChange={(e)=>{
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], variation: e.target.value}}})
                                            }} defaultValue={filtered.variation}>
                                                <option>{filtered.variation}</option>
                                                {variationOptions(v, filtered.variation)}
                                            </select>
                                        </div>
                                        </>
                                        }
                                        {/* {JSON.stringify(get[v].filter(v => v.sid === sidVal)[0])} */}
                                    </div>
                                )
                            })}
                            <hr/>
                        </div>
                    )}
                    )}
            </div>
        )
    }

    const submitUpdate = (update) => {
        if (Object.keys(update.lifts).some(v=>Object.values(update.lifts[v]).some(v=> !!v === false)) 
        || Object.keys(update.newLifts).some(v=>Object.values(update.newLifts[v]).some(v=> !!v === false))) {
            setFeedback("Incomplete Forms")
            return 
        }

        axios({
            method:"PUT",
            data: update,
            withCredentials: true,
            url: `http://localhost:3001/sessions/${user.uid}/${edit}`
        }).then(res=> axios({
            method:"get",
            withCredentials: true,
            url:`http://localhost:3001/sessions/${user.uid}`
        }).then(res=> {
            setGet(res.data[0])
            setEdit(0)
            const earliest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>a-b)[0])
            const latest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>b-a)[0])
            setDateFilter({
                from: new Date(earliest.setTime(earliest.getTime())).toISOString().slice(0,10), 
                to: new Date(latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000)).toISOString().slice(0,10),
                ascending: true
            })
        }))
    }
    
    function addFieldset(exercise) {
        return (
        <fieldset> <div>{exercise}</div>
            <label htmlFor={`${exercise}mass`}>Mass</label>
            <input id={`${exercise}mass`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise],mass: parseFloat(e.target.value)}}})}/>
            <label htmlFor={`${exercise}reps`}>Reps</label>
            <input id={`${exercise}reps`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise], reps: parseInt(e.target.value)}}})}/>
            <label htmlFor={`${exercise}sets`}>Sets</label>
            <input id={`${exercise}sets`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise],sets: parseInt(e.target.value)}}})}/>
            <label htmlFor={`${exercise}scheme`}>Scheme</label>
            <select id={`${exercise}scheme`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise],scheme: e.target.value}}})}>
                <option value="">---</option>
                <option>Pyramid</option>
                <option>Linear</option>
            </select>
            <label htmlFor={`${exercise}variation`}>Variation</label>
            <select id={`${exercise}variation`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise],variation: e.target.value}}})}>
                    <option value="">---</option>
                    {variationOptions(exercise, 'none')}
            </select>
        </fieldset>
        )
    }

    const removeExercise = (exercise) => {
        const newLiftsClone = {}
        Object.keys(update.newLifts).filter(v => v !== exercise).forEach(v => newLiftsClone[v] = Object.assign({}, update.newLifts[v]))
        setUpdate({...update, newLifts: newLiftsClone})
    }

    const loseLift = (exercise) => {
        if (!update.lostLifts.includes(exercise)) {
            const liftsClone = {}
            Object.keys(update.lifts).filter(v=>v !== exercise).forEach(v=>liftsClone[v] = Object.assign({},update.lifts[v]))
            setUpdate({...update, lifts: liftsClone, lostLifts: [...update.lostLifts, exercise] })
            return;
        }
        else if (update.lostLifts.includes(exercise)) {
            const lostLiftsClone = []
            const filtered = get[exercise].filter(v=>v.sid === edit)[0]
            update.lostLifts.filter(v=>v !== exercise).forEach(v=>lostLiftsClone.push(v))
            setUpdate({...update, lifts: {...update.lifts, [exercise]: {
                mass: filtered.mass, reps: filtered.reps, sets: filtered.sets, scheme: filtered.scheme, variation: filtered.variation
            }}, lostLifts: lostLiftsClone})
            return;
        }
    }
    
    return (
        <div>
            <button onClick={() => setEdit(0)}>Cancel Changes</button>
            <button onClick={() => console.log(update, typeof update.date)}>log Update Object</button>
            {/* <button onClick={() => console.log(get.date.filter(v=>v.sid === edit)[0].exercises)}>log get Object</button> */}
            <button onClick={() => submitUpdate(update)}>Submit Update</button>
            {!update ? null : 
            // Object.keys(update.lifts).length === 3 ? null : 
             ['deadlift', 'squat', 'bench'].filter(v=>!get.date.filter(v=>v.sid === edit)[0].exercises.includes(v))
                .map(val=>{return(
                    <div key={`missing${val}`}>
                    <button  onClick={()=>{
                        update.newLifts[val] 
                        ? removeExercise(val) 
                        : setUpdate({...update, newLifts: {...update.newLifts, 
                                [val]: {mass: null, reps: null, sets: null, scheme: null, variation: null}
                            }})
                    }}>
                        {update.newLifts[val] ? `Cancel ` : `Add ` }{val.replace(/^\w/, (c)=>c.toUpperCase())}
                    </button>
                    {update.newLifts[val] ? addFieldset(val) : null}
                    </div>)})
            }
            {returnSid(get, [edit])}
            {feedback}
        </div>
    )
}
