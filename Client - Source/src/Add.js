import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TestAdd() {
  const [create, setCreate] = useState(
    { lifts: {
        deadlift: { mass: null, reps: null, sets: null, scheme: null, variation: null },
        squat: { mass: null, reps: null, sets: null, scheme: null, variation: null },
        bench: { mass: null, reps: null, sets: null, scheme: null, variation: null }
    }, date: null });
  const dateRefs = useRef({date: null, time: null})
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState(null);
  const link = useNavigate();


  useEffect(()=> {
    axios({
        method:"get",
        withCredentials: true,
        url: "http://localhost:3001/authenticated"
    }).then(res => {
        if (!res.data) link('/login')
        else if (res.data) {
            setUser(res.data)
        }
    })
  }, [link])


  function post(clone) {
    axios({
      method: "post",
      data: {
        lifts: clone.lifts,
        date: clone.date,
      },
      withCredentials: true,
      url: `http://localhost:3001/sessions/${user.uid}`,
    }).then((res) => {
        console.log("something happened")
      setResponse(res.data);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const datePart = dateRefs.current.date.value
    const timePart = dateRefs.current.time.value
    if (!datePart || !timePart) {
        setResponse("Timestamp is invalid")
        return console.log("Timestamp is invalid")
    }
    const time = new Date(new Date(datePart).setTime(new Date(datePart).getTime() + parseInt(timePart.slice(0,2)) * 3600000 + parseInt(timePart.slice(3,5)) * 60000)).toISOString()
    const dlClone = Object.assign({}, create.lifts.deadlift)
    const sqClone = Object.assign({}, create.lifts.squat)
    const bClone = Object.assign({}, create.lifts.bench)
    const clone = {date:time, lifts: {deadlift: dlClone, squat: sqClone, bench: bClone}}
    Object.values(clone.lifts.deadlift).some(val => !!val === false) && delete clone.lifts.deadlift
    Object.values(clone.lifts.squat).some(val => !!val === false) && delete clone.lifts.squat
    Object.values(clone.lifts.bench).some(val => !!val === false) && delete clone.lifts.bench
    if (Object.keys(clone.lifts).length > 0) {
        post(clone)
    }
  };

  if (!user) return <strong>Loading...</strong>

  return (
    <div>
        <button onClick={()=>link('/test')}>Go back</button>
        <button onClick={()=>console.log(JSON.stringify(create))}>log create</button>
      <form onSubmit={(e) => handleSubmit(e)}>
        <>
        <label htmlFor="date">Date of Session</label>
        <input id="date" type="date" defaultValue={new Date(Date.now()).toISOString().slice(0,10)} 
            ref={el=>dateRefs.current = {...dateRefs.current, date: el}}/>
        <input type="time" defaultValue={`${new Date(Date.now()).getHours().toString().padStart(2,'0')}:${new Date(Date.now()).getMinutes().toString().padStart(2,'0')}`} 
            ref={el=>dateRefs.current = {...dateRefs.current, time: el}}/>
        </> {/* Date Input Component */}
        {/* <DeadliftField create={create} setCreate={setCreate}/>
        <SquatField create={create} setCreate={setCreate}/>
        <BenchField create={create} setCreate={setCreate}/> */}
        <ExerciseFields create={create} setCreate={setCreate}/>
      <button type="submit">Submit</button>
      </form>
            {response && response}
    </div>
  );
}

function variationOptions(exercise) {
    const dl = ['Conventional', 'Sumo']
    const sq = ['High Bar', 'Front', 'Low Bar']
    const b = ['Close Grip', 'Standard', 'Wide Grip']
    switch (exercise) {
        case 'deadlift':
            return (<>{dl.map(v=><option key={`dl${v}`}>{v}</option>)}</>)
        case 'squat':
            return (<>{sq.map(v=><option key={`sq${v}`}>{v}</option>)}</>)
        case 'bench':
            return (<>{b.map(v=><option key={`b${v}`}>{v}</option>)}</>)
        default: return;
    }
}

function ExerciseFields({create, setCreate}) {
    return (
        <>{["deadlift","squat","bench"].map(exercise=>
            <fieldset key={`${exercise}Field`}> <div>{exercise[0].toUpperCase() + exercise.slice(1)}</div>
            <label htmlFor={`${exercise}mass`}>Mass</label>
            <input id={`${exercise}mass`} onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, [exercise]: {...create.lifts[exercise], mass: parseFloat(e.target.value)}}})}/>
            <label htmlFor={`${exercise}reps`}>Reps</label>
            <input id={`${exercise}reps`} onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, [exercise]: {...create.lifts[exercise], reps: parseInt(e.target.value)}}})}/>
            <label htmlFor={`${exercise}sets`}>Sets</label>
            <input id={`${exercise}sets`} onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, [exercise]: {...create.lifts[exercise], sets: parseInt(e.target.value)}}})}/>
            <label htmlFor={`${exercise}scheme`}>Scheme</label>
            <select id={`${exercise}scheme`} onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, [exercise]: {...create.lifts[exercise], scheme: e.target.value}}})}>
                <option value="">---</option>
                <option>Pyramid</option>
                <option>Linear</option>
            </select>
            <label htmlFor={`${exercise}variation`}>Variation</label>
            <select id={`${exercise}variation`} onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, [exercise]: {...create.lifts[exercise], variation: e.target.value}}})}>
                    <option value="">---</option>
                    {variationOptions(exercise)}
            </select>
            </fieldset>
            )}</>
    )
}
// function DeadliftField({create, setCreate}) {
//     return (
//         <fieldset> <div>Deadlift</div>
//             <label htmlFor="dlmass">Mass</label>
//             <input id="dlmass" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, mass: parseInt(e.target.value)}}})}/>
//             <label htmlFor="dlreps">Reps</label>
//             <input id="dlreps" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, reps: parseInt(e.target.value)}}})}/>
//             <label htmlFor="dlsets">Sets</label>
//             <input id="dlsets" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, sets: parseInt(e.target.value)}}})}/>
//             <label htmlFor="dlscheme">Scheme</label>
//             <select id="dlscheme" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, scheme: e.target.value}}})}>
//                 <option value="">---</option>
//                 <option>Pyramid</option>
//                 <option>Linear</option>
//             </select>
//             <label htmlFor="dlvariation">Variation</label>
//             <select id="dlvariation" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, variation: e.target.value}}})}>
//                     <option value="">---</option>
//                     <option>Conventional</option>
//                     <option>Sumo</option>
//             </select>
//         </fieldset>
//     )
// }
// function SquatField({create, setCreate}) {
//     return (
//         <fieldset> <div>Squat</div>
//             <label htmlFor="sqmass">Mass</label>
//             <input id="sqmass" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, mass: parseInt(e.target.value)}}})}/>
//             <label htmlFor="sqreps">Reps</label>
//             <input id="sqreps" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, reps: parseInt(e.target.value)}}})}/>
//             <label htmlFor="sqsets">Sets</label>
//             <input id="sqsets" onChange={(e) =>
//                 setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, sets: parseInt(e.target.value)}}})}/>
//             <label htmlFor="sqscheme">Scheme</label>
//             <select id="sqscheme" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, scheme: e.target.value}}})}>
//                 <option value="">---</option>
//                 <option>Pyramid</option>
//                 <option>Linear</option>
//             </select>
//             <label htmlFor="sqvariation">Variation</label>
//             <select id="sqvariation" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, variation: e.target.value}}})}>
//                     <option value="">---</option>
//                     <option>High Bar</option>
//                     <option>Front</option>
//                     <option>Low Bar</option>
//             </select>
//             </fieldset>
//     )
// }
// function BenchField({create, setCreate}) {
//     return (
//         <fieldset> <div>Bench</div>
//             <label htmlFor="bmass">Mass</label>
//             <input id="bmass" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, mass: parseInt(e.target.value)}}})}/>
//             <label htmlFor="breps">Reps</label>
//             <input id="breps" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, reps: parseInt(e.target.value)}}})}/>
//             <label htmlFor="bsets">Sets</label>
//             <input id="bsets" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, sets: parseInt(e.target.value)}}})}/>
//             <label htmlFor="bscheme">Scheme</label>
//             <select id="bscheme" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, scheme: e.target.value}}})}>
//                 <option value="">---</option>
//                 <option>Pyramid</option>
//                 <option>Linear</option>
//             </select>
//             <label htmlFor="bvariation">Variation</label>
//             <select id="bvariation" onChange={(e) => 
//                 setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, variation: e.target.value}}})}>
//                     <option value="">---</option>
//                     <option>Close Grip</option>
//                     <option>Standard</option>
//                     <option>Wide Grip</option>
//             </select>
//         </fieldset>
//     )
// }

