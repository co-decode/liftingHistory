import React, { useState } from "react";
import axios from "axios";

export default function TestAdd() {
  const [create, setCreate] = useState(
    { lifts: {
        deadlift: { uid: 2, mass: null, reps: null, sets: null, scheme: null, variation: null },
        squat: { uid: 2, mass: null, reps: null, sets: null, scheme: null, variation: null },
        bench: { uid: 2, mass: null, reps: null, sets: null, scheme: null, variation: null }
    }, date: null });
  const [response, setResponse] = useState(null);

  function post(clone) {
    axios({
      method: "post",
      data: {
        lifts: clone.lifts,
        date: clone.date,
      },
      withCredentials: true,
      url: "http://localhost:3001/sessions/2",
    }).then((res) => {
        console.log("something happened")
      setResponse(res.data);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const time = new Date(Date.now()).toISOString();
    const dlClone = Object.assign({}, create.lifts.deadlift)
    const sqClone = Object.assign({}, create.lifts.squat)
    const bClone = Object.assign({}, create.lifts.bench)
    const clone = {date:time, lifts: {deadlift: dlClone, squat: sqClone, bench: bClone}}
    Object.values(clone.lifts.deadlift).some(val => !!val === false) && delete clone.lifts.deadlift
    Object.values(clone.lifts.squat).some(val => !!val === false) && delete clone.lifts.squat
    Object.values(clone.lifts.bench).some(val => !!val === false) && delete clone.lifts.bench
    // console.log(JSON.stringify(clone))
    // console.log(JSON.stringify(create))
    post(clone)
  };

  return (
    <div>
      Hello World!
      {response && response}
      <form onSubmit={(e) => handleSubmit(e)}>
        <DeadliftField create={create} setCreate={setCreate}/>
        <SquatField create={create} setCreate={setCreate}/>
        <BenchField create={create} setCreate={setCreate}/>
      <button type="submit">Submit</button>
      </form>
      <button onClick={() => console.log(JSON.stringify(create))}>
        Click me
      </button>
    </div>
  );
}

function DeadliftField({create, setCreate}) {
    return (
        <fieldset> <div>Deadlift</div>
            <label htmlFor="dlmass">Mass</label>
            <input id="dlmass" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, mass: parseInt(e.target.value)}}})}/>
            <label htmlFor="dlreps">Reps</label>
            <input id="dlreps" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, reps: parseInt(e.target.value)}}})}/>
            <label htmlFor="dlsets">Sets</label>
            <input id="dlsets" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, sets: parseInt(e.target.value)}}})}/>
            <label htmlFor="dlscheme">Scheme</label>
            <select id="dlscheme" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, scheme: e.target.value}}})}>
                <option value="">---</option>
                <option>Pyramid</option>
                <option>Linear</option>
            </select>
            <label htmlFor="dlvariation">Variation</label>
            <select id="dlvariation" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, deadlift: {...create.lifts.deadlift, variation: e.target.value}}})}>
                    <option value="">---</option>
                    <option>Conventional</option>
                    <option>Sumo</option>
            </select>
        </fieldset>
    )
}
function SquatField({create, setCreate}) {
    return (
        <fieldset> <div>Squat</div>
            <label htmlFor="sqmass">Mass</label>
            <input id="sqmass" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, mass: parseInt(e.target.value)}}})}/>
            <label htmlFor="sqreps">Reps</label>
            <input id="sqreps" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, reps: parseInt(e.target.value)}}})}/>
            <label htmlFor="sqsets">Sets</label>
            <input id="sqsets" onChange={(e) =>
                setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, sets: parseInt(e.target.value)}}})}/>
            <label htmlFor="sqscheme">Scheme</label>
            <select id="sqscheme" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, scheme: e.target.value}}})}>
                <option value="">---</option>
                <option>Pyramid</option>
                <option>Linear</option>
            </select>
            <label htmlFor="sqvariation">Variation</label>
            <select id="sqvariation" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, squat: {...create.lifts.squat, variation: e.target.value}}})}>
                    <option value="">---</option>
                    <option>High Bar</option>
                    <option>Front</option>
                    <option>Low Bar</option>
            </select>
            </fieldset>
    )
}
function BenchField({create, setCreate}) {
    return (
        <fieldset> <div>Bench</div>
            <label htmlFor="bmass">Mass</label>
            <input id="bmass" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, mass: parseInt(e.target.value)}}})}/>
            <label htmlFor="breps">Reps</label>
            <input id="breps" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, reps: parseInt(e.target.value)}}})}/>
            <label htmlFor="bsets">Sets</label>
            <input id="bsets" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, sets: parseInt(e.target.value)}}})}/>
            <label htmlFor="bscheme">Scheme</label>
            <select id="bscheme" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, scheme: e.target.value}}})}>
                <option value="">---</option>
                <option>Pyramid</option>
                <option>Linear</option>
            </select>
            <label htmlFor="bvariation">Variation</label>
            <select id="bvariation" onChange={(e) => 
                setCreate({...create, lifts:{...create.lifts, bench: {...create.lifts.bench, variation: e.target.value}}})}>
                    <option value="">---</option>
                    <option>Close Grip</option>
                    <option>Standard</option>
            </select>
        </fieldset>
    )
}