import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TestAdd() {
  const [create, setCreate] = useState({
    lifts: {
      deadlift: { mass: null, reps: null, variation: null },
      squat: { mass: null, reps: null, variation: null },
      bench: { mass: null, reps: null, variation: null },
    },
    date: null,
  });
  const dateRefs = useRef({ date: null, time: null });
  const exerciseRefs = useRef({ deadlift: {}, squat: {}, bench: {} });
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState(null);
  const link = useNavigate();

  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: "http://localhost:3001/authenticated",
    }).then((res) => {
      if (!res.data) link("/login");
      else if (res.data) {
        setUser(res.data);
      }
    });
  }, [link]);

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
      console.log("something happened");
      setResponse(res.data);
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const datePart = dateRefs.current.date.value;
    const timePart = dateRefs.current.time.value;

    if (!datePart || !timePart) {
      setResponse("Timestamp is invalid");
      return console.log("Timestamp is invalid");
    }
    const time = new Date(
      new Date(datePart).setTime(
        new Date(datePart).getTime() +
          parseInt(timePart.slice(0, 2)) * 3600000 +
          parseInt(timePart.slice(3, 5)) * 60000
      )
    ).toISOString();
    const dlClone = Object.assign({}, create.lifts.deadlift);
    const sqClone = Object.assign({}, create.lifts.squat);
    const bClone = Object.assign({}, create.lifts.bench);
    const clone = {
      date: time,
      lifts: { deadlift: dlClone, squat: sqClone, bench: bClone },
    };
    Object.values(clone.lifts.deadlift).some((val) => !!val === false) &&
      delete clone.lifts.deadlift;
    Object.values(clone.lifts.squat).some((val) => !!val === false) &&
      delete clone.lifts.squat;
    Object.values(clone.lifts.bench).some((val) => !!val === false) &&
      delete clone.lifts.bench;
    if (Object.keys(clone.lifts).length > 0) {
      post(clone);
    }
  };

  function logRefs() {
    const clone = {};
    ["deadlift", "squat", "bench"].forEach(exercise => {
      let repArray = []
      let massArray = []
      let varArray = []

      Object.keys(exerciseRefs.current[exercise]).forEach(val => {
        if (exerciseRefs.current[exercise][val].reps) {
        repArray = [...repArray, parseInt(exerciseRefs.current[exercise][val].reps.value)]
        massArray = [...massArray, parseFloat(exerciseRefs.current[exercise][val].mass.value)]}
      })
      Object.keys(exerciseRefs.current[exercise].variation).forEach((val,i) => {
        varArray = [...varArray, exerciseRefs.current[exercise].variation[i].value]
      })
      console.log(repArray, massArray, varArray)
      clone[exercise] = {mass: [...massArray], reps: [...repArray], variation: [...varArray] }
    })
    setCreate({...create, lifts: {...clone}})
  }

  if (!user) return <strong>Loading...</strong>;

  return (
    <div>
      <button onClick={() => link("/log")}>Go back</button>
      <button onClick={() => console.log(JSON.stringify(create))}>
        log create
      </button>
      <button onClick={() => {
       logRefs()}}>
          log exrefs
        </button>

      <form onSubmit={(e) => handleSubmit(e)}>
        <DateInput dateRefs={dateRefs} />
        <ExerciseFieldSets exerciseRefs={exerciseRefs} />
        {/* <ExerciseFields create={create} setCreate={setCreate} /> */}
        <button type="submit">Submit</button>
      </form>
      {response && response}
    </div>
  );
}

function variationOptions(exercise, array, exerciseRefs) {

  return (<div>{array.map((val,i) => { 
    return (
      <div style={{display:"inline-block"}} key={`${exercise}VariationDiv${i}`}>
        <label htmlFor={`${exercise}Variation${i}`}>{i === 0 ? 'Variation ' : null}{i + 1}:</label>
        <select id={`${exercise}Variation${i}`}
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                variation: { ...exerciseRefs.current[exercise].variation, [i]: el },
              },
            })
          }>
          <option value=""> --- </option>
          {val.map(v=> <option key={`${exercise}Option${v}`}>{v}</option>)}
        </select>
      </div>
    )})}</div>)
}

function ExerciseFieldSets({ exerciseRefs }) {
  const [fields, setFields] = useState([0, 0, 0]);

  const lengthenArr = (number, exercise) => {
    const arr = Array(0);
    arr.length = number;
    arr.fill(null);
    return arr.map((v, i) => (
      <div key={`${"exercise"}${i + 1}`}>
        <strong>Set {i + 1}:</strong>
        <label>Mass</label>
        <input
          id={`${"exercise"}Set${i + 1}Mass`}
          type="number"
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                [i + 1]: { ...exerciseRefs.current[exercise][i + 1], mass: el },
              },
            })
          }
        />
        <label>Reps</label>
        <input
          id={`${"exercise"}Set${i + 1}Reps`}
          type="number"
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                [i + 1]: { ...exerciseRefs.current[exercise][i + 1], reps: el },
              },
            })
          }
        />
      </div>
    ));
  };

  const variationArray = [
    [
      ["Conventional", "Sumo"],
      ["Double Overhand", "Mixed Grip", "Straps"],
    ],
    [["High Bar", "Front", "Low Bar"]],
    [
      ["Close Grip", "Standard", "Wide Grip"],
      ["Flat", "Incline"],
    ],
  ];
  return ["deadlift", "squat", "bench"].map((exercise, eInd) => {
    return (
      <fieldset key={`${exercise}FieldSet`}>
        
        <div style={{ fontWeight: "bold" }}>
          {exercise[0].toUpperCase() + exercise.slice(1)}
        </div>
        <label htmlFor={`${exercise}Sets`}>Sets</label>
        <input
          id={`${exercise}Sets`}
          type="number"
          min={0}
          max={20}
          onChange={(e) =>
            e.target.value >= 0 && e.target.value <= 20
              ? setFields(
                  [...fields].map((val, ind) =>
                    ind === eInd ? parseInt(e.target.value) : val
                  )
                )
              : null
          }
        />
          {variationOptions(exercise, variationArray[eInd], exerciseRefs)}
        {fields[eInd] ? lengthenArr(fields[eInd], exercise) : null}
      </fieldset>
    );
  });
}

function DateInput({ dateRefs }) {
  return (
    <>
      <label htmlFor="date">Date of Session</label>
      <input
        id="date"
        type="date"
        defaultValue={new Date(Date.now()).toISOString().slice(0, 10)}
        ref={(el) => (dateRefs.current = { ...dateRefs.current, date: el })}
      />
      <input
        type="time"
        defaultValue={`${new Date(Date.now())
          .getHours()
          .toString()
          .padStart(2, "0")}:${new Date(Date.now())
          .getMinutes()
          .toString()
          .padStart(2, "0")}`}
        ref={(el) => (dateRefs.current = { ...dateRefs.current, time: el })}
      />
    </>
  );
}
