import React, { useEffect, useState } from "react";
import axios from "axios";

function variationOptions(exercise, existing) {
    const dl = ['Conventional', 'Sumo']
    const sq = ['High Bar', 'Front', 'Low Bar']
    const b = ['Standard', 'Close Grip']
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

export default function Edit({get, setGet, edit, setEdit, user}) {
    
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
                    return (
                        <div key={sidVal}>
                            <div>{new Date(get.date.filter(v => v.sid === sidVal)[0].date).toString()}</div>
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
                                                setUpdate({...update, lifts: {...update.lifts, [v]: {...update.lifts[v], mass: parseInt(e.target.value)}}})
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
        }))
    }
    
    function addFieldset(exercise) {
        return (
        <fieldset> <div>{exercise}</div>
            <label htmlFor={`${exercise}mass`}>Mass</label>
            <input id={`${exercise}mass`} onChange={e=>setUpdate({...update, newLifts: {...update.newLifts, [exercise]: {...update.newLifts[exercise],mass: parseInt(e.target.value)}}})}/>
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
            {/* <button onClick={() => console.log(update)}>log Update Object</button> */}
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

// If the entry is missing lifts, add a button for adding a lift, a button for each missing lift
// Button should be nicely capitalised.
// Button click should add fields for input, and it should populate the newLifts property of the update object.
// After showing fieldset, the button should read 'remove <exercise>' and should edit the newLifts property.
// The fieldset should change the update object on completion
    // What happens when an incomplete newLifts object is submitted? CRASH
    // Add some validation.
// Only thing left to do is remove lifts
    // Make sure the deletion is undoable.
// There should be a button that says remove lift
// The button should populate the lostLifts object, and depopulate the lifts object.
// The button should hide, or disable the exercise information.
// The button should depop the lostLifts, repop the lifts and re show the exercise information on second click.
    // The button should read 'undo removal'

// It works...

// DONE - I would like the page to load back to the position of the selected session.
// Refreshing on the edit page redirects back to the all sessions page... can I set up a router instead of dynamic components?
    // Not sure this is fixable... nor is it necessarily unworkable... I think I do leave it for now.

// I would like to sort entries by date.
// I would like to be able to reverse the order of the display.


// I should now integrate these components into the authentication process. I'll plan this before going ahead.
