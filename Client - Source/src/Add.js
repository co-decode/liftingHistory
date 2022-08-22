import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backend } from "./utils/variables";

export default function Add({ get, setPage, setGet, setDateFilter}) {
  const dateRefs = useRef({ date: null, time: null });
  const exerciseRefs = useRef({});
  const [exArr, setExArr] = useState([]);
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const link = useNavigate();

  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    }).then((res) => {
      if (!res.data) link("/login");
      else if (res.data) {
        setUser(res.data);
      }
    });
  }, [link]);

  useEffect(() => {
    let timer;
    if (response) {
      timer = setTimeout(() => setResponse(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [response]);

  function post(submission) {
    axios({
      method: "post",
      data: {
        lifts: submission.lifts,
        date: submission.date,
      },
      withCredentials: true,
      url: `${backend}/sessions/${user.uid}`,
    }).then((res) => {
      setResponse(res.data);
    }).then((res) =>
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/sessions/${user.uid}`,
    }).then((res) => {
      setGet(res.data[0]);
      redirect && setPage("LOG")
      const earliest = new Date(
        res.data[0].date.map((v) => new Date(v.date)).sort((a, b) => a - b)[0]
      );
      const latest = new Date(
        res.data[0].date.map((v) => new Date(v.date)).sort((a, b) => b - a)[0]
      );
      setDateFilter({
        from: new Date(earliest.setTime(earliest.getTime()))
          .toISOString()
          .slice(0, 10),
        to: new Date(latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000))
          .toISOString()
          .slice(0, 10),
        ascending: true,
      });
    })
  );
  }

  const handleSubmit = async (e) => {
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

    const lifts = {};
    exArr.forEach((exercise) => {
      let repArray = [];
      let massArray = [];
      let varArray = [];

      Object.keys(exerciseRefs.current[exercise]).forEach((val) => {
        if (exerciseRefs.current[exercise][val].reps) {
          repArray = [
            ...repArray,
            parseInt(exerciseRefs.current[exercise][val].reps.value),
          ];
          massArray = [
            ...massArray,
            parseFloat(exerciseRefs.current[exercise][val].mass.value),
          ];
        }
      });
      Object.keys(exerciseRefs.current[exercise].variation).forEach(
        (val, i) => {
          varArray = [
            ...varArray,
            exerciseRefs.current[exercise].variation[i].value,
          ];
        }
      );
      lifts[exercise] = {
        mass: [...massArray],
        reps: [...repArray],
        variation: [...varArray],
      };
    });

    const submission = { date: time, lifts };

    if (get.date?.some(session =>session.date === submission.date.slice(0,19))) {
      setResponse("A session has already been recorded for this Timestamp")
      return
    }

    if (Object.keys(submission.lifts).length > 0 ) {
      post(submission);
    }
  };

  if (!user) return <strong>Loading...</strong>;

  return (
    <div>
      {/* <button onClick={() => link("/log")}>Go back</button> */}
      <ExerciseAdd exArr={exArr} setExArr={setExArr} />
      <label>Redirect on submit
        <input type="checkbox" onChange={(e)=>setRedirect(e.target.checked)} />
      </label>
      <form onSubmit={(e) => handleSubmit(e)}>
        <DateInput dateRefs={dateRefs} />
        <ExerciseFieldSets exerciseRefs={exerciseRefs} exArr={exArr} get={get}/>
        {exArr.length ? (
          <button type="submit">Submit</button>
        ) : (
          <div>Add some exercises!</div>
        )}
      </form>
      {response && response}
    </div>
  );
}

function variationOptions(exercise, array, exerciseRefs) {
  return (
    <div>
      {array.map((val, i) => {
        return (
          <div
            style={{ display: "inline-block" }}
            key={`${exercise}VariationDiv${i}`}
          >
            <label htmlFor={`${exercise}Variation${i}`}>
              {i === 0 ? "Variation " : null}
              {i + 1}:
            </label>
            <select
              id={`${exercise}Variation${i}`}
              required
              ref={(el) =>
                (exerciseRefs.current = {
                  ...exerciseRefs.current,
                  [exercise]: {
                    ...exerciseRefs.current[exercise],
                    variation: {
                      ...exerciseRefs.current[exercise]?.variation,
                      [i]: el,
                    },
                  },
                })
              }
            >
              <option value=""> --- </option>
              {val.map((v) => (
                <option key={`${exercise}Option${v}`}>{v}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function ExerciseAdd({ exArr, setExArr }) {
  return (
    <>
      {["deadlift", "squat", "bench"].map((exercise) => {
        return (
          <div style={{ display: "inline-block" }} key={`${exercise}Add`}>
            <label htmlFor={`${exercise}Add`}>
              {exercise[0].toUpperCase() + exercise.slice(1)}:{" "}
            </label>
            <input
              id={`${exercise}Add`}
              type="checkbox"
              onClick={() =>
                exArr.includes(exercise)
                  ? setExArr([...exArr.filter((v) => v !== exercise)])
                  : setExArr([...exArr, exercise])
              }
            />
          </div>
        );
      })}
    </>
  );
}

function ExerciseFieldSets({ exerciseRefs, exArr, get }) {
  const [fields, setFields] = useState({ deadlift: 0, squat: 0, bench: 0 });
  
  
  const lengthenArr = (number, exercise) => {
    const arr = Array(0);
    arr.length = number;
    arr.fill(null);
    return arr.map((v, i) => (
      <div key={`${"exercise"}${i + 1}`}>
        <strong>Set {i + 1}: </strong>
        <label>Mass</label>
        <input
          id={`${"exercise"}Set${i + 1}Mass`}
          type="number"
          step="0.25"
          required
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
          step="0.25"
          required
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

  const variationObject = {
    deadlift: [
      ["Conventional", "Sumo"],
      ["Double Overhand", "Mixed Grip", "Straps"],
    ],
    squat: [["High Bar", "Front", "Low Bar"]],
    bench: [
      ["Close Grip", "Standard", "Wide Grip"],
      ["Flat", "Incline"],
    ],
  };
  return exArr.map((exercise) => {
    
    function returnTemplateButton() {
      if (!get.date) return null
      if (get.date.every(v=>!v.exercises.includes(exercise))) return null

      const mostRecentExerciseSessionSID = get.date
        .filter((val) => val.exercises.includes(exercise))
        .reduce((acc, val) =>
          new Date(val.date) > new Date(acc.date) ? val : acc).sid;
  
      const sets = get[exercise].filter(
        (v) => v.sid === mostRecentExerciseSessionSID
        )[0].mass.length

      return (
        <button onClick={(e)=>getPrevTemplate(e, mostRecentExerciseSessionSID, sets)}>{fields[exercise] < sets ? "Use Previous Template" : "Fill with Previous Session"}</button>
      )
    }
    
    function getPrevTemplate(e, mostRecentExerciseSessionSID, sets) {
      e.preventDefault();
        
      if (fields[exercise] < sets){
        setFields({...fields, [exercise]: sets})
        return
      }

      if (exerciseRefs.current[exercise]) {
        Object.keys(exerciseRefs.current[exercise]).forEach((key) => {
          if (exerciseRefs.current[exercise][key].mass) {
            exerciseRefs.current[exercise][key].mass.value = get[exercise].filter(
              (v) => v.sid === mostRecentExerciseSessionSID
            )[0].mass[key - 1];
            exerciseRefs.current[exercise][key].reps.value = get[exercise].filter(
              (v) => v.sid === mostRecentExerciseSessionSID
            )[0].reps[key - 1];
          }
        });
  
        Object.keys(exerciseRefs.current[exercise].variation).forEach((key) => {
          exerciseRefs.current[exercise].variation[key].value =
            get[exercise].filter(
              (v) => v.sid === mostRecentExerciseSessionSID
            )[0].variation[key];
        });
      }
    }
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
              ? setFields({ ...fields, [exercise]: parseInt(e.target.value) })
              : null
          }
          placeholder={fields[exercise] ? fields[exercise] : 0}
        />
        {variationOptions(exercise, variationObject[exercise], exerciseRefs)}
        {fields[exercise] ? lengthenArr(fields[exercise], exercise) : null}
        {/* <button onClick={(e)=>getPrevTemplate(e)}>{fields[exercise] < sets ? "Use Previous Template" : "Fill with Previous Session"}</button> */}
        {returnTemplateButton()}
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
        defaultValue={new Date(
          Date.now() - 1000 * 60 * new Date(Date.now()).getTimezoneOffset()
        )
          .toISOString()
          .slice(0, 10)}
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
