import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backend, exerciseArray, variationObject } from "./utils/variables";
import Spinner from "./utils/Spinner";

export default function Add({
  get,
  setPage,
  setGet,
  setDateFilter,
  dateFilter,
  varFilter,
  setVarFilter,
}) {
  const dateRefs = useRef({ date: null, time: null });
  const exerciseRefs = useRef({});
  const fileRef = useRef();
  const [blob, setBlob] = useState();
  const [exArr, setExArr] = useState([]);
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    axios({
      method: "post",
      data: {
        lifts: submission.lifts,
        date: submission.date,
      },
      withCredentials: true,
      url: `${backend}/sessions/${user.uid}`,
    })
      .then((res) => {
        setLoading(false);
        setResponse(res.data);
      })
      .then((res) =>
        axios({
          method: "get",
          withCredentials: true,
          url: `${backend}/sessions/${user.uid}`,
        })
          .then((res) => {
            let varFilterAddition = {};
            const newExercises = Object.keys(res.data).filter(
              (key) => !Object.keys(get).includes(key)
            );
            newExercises.forEach(
              (exercise) => (varFilterAddition[exercise] = [])
            );
            setVarFilter({ ...varFilter, ...varFilterAddition });
            setGet(res.data);
            const earliest = new Date(
              res.data.sessions
                .map((v) => new Date(v.date))
                .sort((a, b) => a - b)[0]
            );
            const latest = new Date(
              res.data.sessions
                .map((v) => new Date(v.date))
                .sort((a, b) => b - a)[0]
            );
            setDateFilter({
              from: new Date(earliest.setTime(earliest.getTime()))
                .toISOString()
                .slice(0, 10),
              to: new Date(
                latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000)
              )
                .toISOString()
                .slice(0, 10),
              ascending: dateFilter.ascending,
            });
          })
          .then(() => redirect && setPage("LOG"))
      );
  }

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const datePart = dateRefs.current.date.value;
    const timePart = dateRefs.current.time.value;

    if (!datePart || !timePart) {
      setResponse("Timestamp is invalid");
      return;
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
    if (
      get.sessions?.some((session) => {
        function correctTimezone(dateString) {
          const dateObject = new Date(dateString);
          const correction = dateObject.setTime(
            dateObject.getTime() - 1000 * 60 * dateObject.getTimezoneOffset()
          );
          return new Date(correction).toISOString().slice(0, 19);
        }
        return correctTimezone(session.date) === submission.date.slice(0, 19);
      })
    ) {
      setResponse("A session has already been recorded for this Timestamp");
      return;
    }

    if (Object.keys(submission.lifts).length > 0) {
      post(submission);
    }
  };

  function readFile() {
    let file = fileRef.current.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      // console.log(reader.result)
      setBlob(reader.result);
    };
  }

  let downloadableFile = new File(
    [JSON.stringify([1, 2, 3, 4, 5])],
    `hello.json`,
    {
      type: "application/json",
    }
  );

  let fileURL = URL.createObjectURL(downloadableFile);

  if (!user)
    return (
      <>
        <strong>Loading...</strong>
        <Spinner />
      </>
    );

  return (
    <div>
      <ExerciseAdd exArr={exArr} setExArr={setExArr} />
      <label>
        Redirect on submit
        <input
          type="checkbox"
          onChange={(e) => setRedirect(e.target.checked)}
        />
      </label>
      <form
        onKeyDown={(e) => e.code === "Enter" && e.preventDefault()}
        onSubmit={(e) => handleSubmit(e)}
      >
        <label>
          Download a file:
          <a href={`${fileURL}`} download={"hello.json"}>
            CLICK ME
          </a>
        </label>
        <button onClick={() => readFile()}>Output file read</button>
        <label>
          Upload a file:
          <input type="file" ref={fileRef} />
        </label>
        <button onClick={() => readFile()}>Output file read</button>
        {/* <div>{!!blob && console.log(JSON.parse(blob))}</div> */}
        <br />
        <DateInput dateRefs={dateRefs} />
        <ExerciseFieldSets
          exerciseRefs={exerciseRefs}
          exArr={exArr}
          get={get}
          blob={blob}
        />
        {exArr.length ? (
          <button type="submit">Submit</button>
        ) : (
          <div>Add some exercises!</div>
        )}
      </form>
      {response && response}
      {loading && <Spinner />}
    </div>
  );
}

function VariationOptions({
  get,
  exercise,
  exerciseRefs,
  varFields,
  setVarFields,
  customs,
}) {
  //!
  const customRef = useRef({});

  const [customAdditions, setCustomAdditions] = useState(customs);
  const number = variationObject[exercise].length;
  const [array, setArray] = useState(() =>
    Array(number + varFields[exercise])
      .fill(null)
      .map((val, ind) => {
        if (ind < number) {
          return variationObject[exercise][ind];
        } else return customs;
      })
  );

  useEffect(
    () =>
      setArray(
        Array(number + varFields[exercise])
          .fill(null)
          .map((val, ind) => {
            if (ind < number) {
              return variationObject[exercise][ind];
            } else {
              if (customAdditions.length) {
                let output = [...customs];
                customAdditions.forEach((addition) => {
                  if (!output.includes(addition)) output.push(addition);
                });
                return output;
              }
              return customs;
            }
          })
      ),
    [varFields, exercise, number, customAdditions, customs]
  );
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
      {varFields[exercise] < 3 && (
        <button
          type="button"
          onClick={() =>
            setVarFields({ ...varFields, [exercise]: varFields[exercise] + 1 })
          }
        >
          +
        </button>
      )}
      {varFields[exercise] > 0 && (
        <button
          type="button"
          onClick={() =>
            setVarFields({ ...varFields, [exercise]: varFields[exercise] - 1 })
          }
        >
          -
        </button>
      )}
      {!!varFields[exercise] && (
        <>
          <label>
            {" "}
            Custom entry
            <input type="text" placeholder="too" ref={customRef} />
          </label>
          <button
            type="button"
            onClick={() =>
              customRef.current.value &&
              !customAdditions.includes(customRef.current.value) &&
              setCustomAdditions([...customAdditions, customRef.current.value])
            }
          >
            add custom
          </button>
        </>
      )}
    </div>
  );
}

function ExerciseAdd({ exArr, setExArr }) {
  return (
    <>
      {exerciseArray.map((exercise) => {
        return (
          <div style={{ display: "inline-block" }} key={`${exercise}Add`}>
            <label htmlFor={`${exercise}Add`}>
              {exercise
                .split("_")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}
              :{" "}
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
            &nbsp;|&nbsp;
          </div>
        );
      })}
    </>
  );
}

function ExerciseFieldSets({ exerciseRefs, exArr, get, blob }) {
  const [fields, setFields] = useState({});
  const macroRefs = useRef()
  const [macroState, setMacroState] = useState({})
  // const [macroRange, setMacroRange] = useState({})
  const [varFields, setVarFields] = useState();
  const prevExArr = useRef(exArr);
  const [customs, setCustoms] = useState(() => {
    const customsArray = [];
    exArr.forEach((exercise) => {
      if (!get[exercise]) return [];
      get[exercise].forEach((sess) =>
        sess.variation.forEach(
          (variation) =>
            !variationObject[exercise].flat().includes(variation) &&
            !customsArray.includes(variation) &&
            customsArray.push(variation)
        )
      );
    });
    return customsArray;
  }, [get, exArr]);

  useEffect(() => {
    if (prevExArr.current.length !== exArr.length) {
      const fieldObject = { ...fields };
      const varObject = { ...varFields };
      const customsObject = { ...customs };
      exArr.forEach((ex) => {
        if (fields[ex] === undefined) {
          fieldObject[ex] = 0;
          varObject[ex] = 0;
        }

        if (get[ex]) {
          if (!customsObject[ex]) customsObject[ex] = [];
          get[ex].forEach((sess) =>
            sess.variation_templates.flat()
            .reduce((acc, vari) => !!vari && !acc.includes(vari) ? [...acc, vari] : acc, [])
            .forEach((variation) =>
                !variationObject[ex].flat().includes(variation) &&
                !customsObject[ex].includes(variation) &&
                customsObject[ex].push(variation)
            )
          );
        } else if (!get[ex]) {
          customsObject[ex] = [];
        }
      });
      setFields(fieldObject);
      setVarFields(varObject);
      prevExArr.current = exArr;
      setCustoms(customsObject);
    }
  }, [exArr, fields, varFields, customs, get]);

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

  return exArr.map((exercise) => {
    if (!macroState[exercise]) setMacroState({...macroState, [exercise]: {
      fields: "Mass",
      range: "All",
      number: null,
      from: 1,
      to: 1
    }})

    function returnTemplateButton() {
      if (!get.sessions) return null;
      if (get.sessions.every((v) => !v.exercises.includes(exercise)))
        return null;

      const mostRecentExerciseSessionSID = get.sessions
        .filter((val) => val.exercises.includes(exercise))
        .reduce((acc, val) =>
          new Date(val.date) > new Date(acc.date) ? val : acc
        ).sid;

      const sets = get[exercise].find(
        (v) => v.sid === mostRecentExerciseSessionSID
      ).mass.length;

      return (
        <button
          onClick={(e) =>
            getPrevTemplate(e, mostRecentExerciseSessionSID, sets, blob)
          }
        >
          {fields[exercise] < sets
            ? "Use Previous Template"
            : "Fill with Previous Session"}
        </button>
      );
    }

    function getPrevTemplate(e, mostRecentExerciseSessionSID, sets, blob) {
      e.preventDefault();
      blob = JSON.parse(blob);
      const noOfVars = blob.variation.length - variationObject[exercise].length;
      if (blob) {
        var [readFields, readVariation, readSets] = [
          blob.fields,
          blob.variation,
          blob.sets,
        ];
      }
      new Promise((resolve) => {
        if (fields[exercise] < sets)
          setFields({ ...fields, [exercise]: readFields /* sets */ }); // Fields set here : fields
        if (varFields[exercise] < noOfVars) {
          setVarFields({ ...varFields, [exercise]: noOfVars });
        }
        if (
          blob.variation
            .slice(2)
            .some((vari) => !customs[exercise].includes(vari))
        ) {
          let addToCustoms = [];
          blob.variation
            .slice(2)
            .filter((vari) => !customs[exercise].includes(vari))
            .forEach((vari) => addToCustoms.push(vari));
          setCustoms({
            ...customs,
            [exercise]: [...customs[exercise], ...addToCustoms],
          });
        }
        resolve("Done");
      }).then(() => {
        const refsExist = () => {
          if (
            Object.keys(exerciseRefs.current[exercise].variation).every(
              (varNo) => !!exerciseRefs.current[exercise].variation[varNo]
            ) &&
            Object.keys(exerciseRefs.current[exercise].variation).length >=
              readVariation.length
          ) {
            if (exerciseRefs.current[exercise]) {
              Object.keys(exerciseRefs.current[exercise]).forEach((key) => {
                if (exerciseRefs.current[exercise][key].mass) {
                  exerciseRefs.current[exercise][key].mass.value =
                    readSets[key].mass;

                  /* get[exercise].find( //! Fields set here : sets - [1,2,3...] - mass
                      (v) => v.sid === mostRecentExerciseSessionSID
                    ).mass[key - 1]; */
                  exerciseRefs.current[exercise][key].reps.value =
                    readSets[key].reps;

                  /* get[exercise].find( //! Fields set here : sets - [1,2,3...] - reps
                      (v) => v.sid === mostRecentExerciseSessionSID
                    ).reps[key - 1]; */
                }
              });
              Object.keys(exerciseRefs.current[exercise].variation).forEach(
                (index) => {
                  exerciseRefs.current[exercise].variation[index].value =
                    readVariation[index];

                  /* get[exercise]   //! Fields set here : variation: []
                    .find((v) => v.sid === mostRecentExerciseSessionSID).variation[index];  */
                }
              );
            }
          } else setTimeout(() => refsExist(), 0);
        };
        refsExist();
      });
    }

    function handleMacro(e) {
      e.preventDefault()
      var {fields: col, range, number} = macroRefs.current[exercise]
      
      const target = exerciseRefs.current[exercise]
      function changeFields(from, to) {
        if (col.value !== "Mass") {
          Object.keys(target).filter(key=> key !== "variation" && key <= to && key >= from).forEach((setNo)=>target[setNo].reps.value = number.value)
        }
        if (col.value !== "Reps") {
          Object.keys(target).filter(key=> key !== "variation" && key <= to && key >= from).forEach(setNo=> target[setNo].mass.value = number.value)
        }
      }

      if (range.value === "Range") {
        var {from, to} = macroRefs.current[exercise]
        if (to.value > fields[exercise] || to.value <= from.value ) to.value = fields[exercise]
        if (from.value >= to.value) from.value = 1
        changeFields(from.value, to.value)
      }
      else {
        changeFields(1, fields[exercise])
      }
    }

    return (
      <div
        key={`${exercise}FieldSet`}
        style={{ border: "1px solid grey", margin: "-1px 0", padding: "2px" }}
      >
        <div style={{ fontWeight: "bold" }}>
          {exercise
            .split("_")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}
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
        {varFields && varFields[exercise] !== undefined && (
          <VariationOptions
            get={get}
            exercise={exercise}
            varFields={varFields}
            setVarFields={setVarFields}
            /* variationObject[exercise] */ exerciseRefs={exerciseRefs}
            customs={customs[exercise]}
          />
        )}{" "}
        {/* //! */}
        {!!fields[exercise] && (
          <>
            <div>
              Fill
              <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], fields: e.target.value}})} 
                      ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {fields: el}}}
                      defaultValue={macroState[exercise].fields}>
                <option>Mass</option>
                <option>Reps</option>
                <option>Both</option>
              </select>&nbsp;
              with <input type="number" max="999" min="0" 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], number: e.target.value}})} 
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], number: el}}} style={{ width: "9ch" }} 
                defaultValue={macroState[exercise].number}/> for&nbsp;
              <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], range: e.target.value}})} 
                      ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], range: el}}}
                      defaultValue={macroState[exercise].range}>
                <option>All</option>
                <option>Range</option>
              </select>
              { macroState[exercise].range === "Range" && <>
              {": Sets "}
              <input type="number" max="20" min="0" 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], from: e.target.value}})}
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], from: el}}} style={{ width: "5ch" }} 
                defaultValue={macroState[exercise].from}/> to&nbsp;
              <input type="number" max="20" min="0" 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], to: e.target.value}})}
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], to: el}}} style={{ width: "5ch" }} 
                defaultValue={macroState[exercise].to}/>
              </>}
              <button type="" onClick={handleMacro}>Go</button>
            </div>
            {lengthenArr(fields[exercise], exercise)}
          </>
        )}
        {returnTemplateButton()}
      </div>
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
