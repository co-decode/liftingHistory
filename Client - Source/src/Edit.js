import React, { useEffect, useState } from "react";
import axios from "axios";

function variationOptions(exercise, existing) {
  const dl = ["Conventional", "Sumo"];
  const sq = ["High Bar", "Front", "Low Bar"];
  const b = ["Standard", "Close Grip", "Wide Grip"];
  switch (exercise) {
    case "deadlift":
      return (
        <>
          {dl
            .filter((v) => v !== existing)
            .map((v) => (
              <option key={`dl${v}`}>{v}</option>
            ))}
        </>
      );
    case "squat":
      return (
        <>
          {sq
            .filter((v) => v !== existing)
            .map((v) => (
              <option key={`sq${v}`}>{v}</option>
            ))}
        </>
      );
    case "bench":
      return (
        <>
          {b
            .filter((v) => v !== existing)
            .map((v) => (
              <option key={`b${v}`}>{v}</option>
            ))}
        </>
      );
    default:
      return;
  }
}

export default function Edit({
  get,
  setGet,
  edit,
  setEdit,
  user,
  setDateFilter,
}) {
  const [update, setUpdate] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const session = get.date.filter((v) => v.sid === edit)[0];
    const updateObject = {
      lifts: {},
      newLifts: {},
      lostLifts: [],
      date: session.date,
    };
    session.exercises.forEach((v) => {
      const filtered = get[v].filter((v) => v.sid === edit)[0];
      updateObject.lifts[v] = {
        mass: filtered.mass,
        reps: filtered.reps,
        variation: filtered.variation,
      };
    });
    setUpdate(updateObject);
  }, [get, edit]);

  useEffect(() => {
    setFeedback(null);
  }, [update]);

  function returnSid(get, sidList) {
    return (
      <div>
        {sidList.map((sidVal) => {
          let exerciseCall = get.date.filter((v) => v.sid === sidVal)[0]
            .exercises;
          let time = new Date(
            new Date(get.date.filter((v) => v.sid === sidVal)[0].date).setTime(
              new Date(
                get.date.filter((v) => v.sid === sidVal)[0].date
              ).getTime() +
                9 * 60 * 1000 * 60 +
                30 * 60 * 1000
            )
          ).toISOString();
          return (
            <div key={sidVal}>
              <>
                <label htmlFor="date">Date of Session</label>
                <input
                  id="date"
                  type="date"
                  defaultValue={time.slice(0, 10)}
                  onChange={(e) =>
                    setUpdate({
                      ...update,
                      date: e.target.value + update.date.slice(10),
                    })
                  }
                />
                <input
                  type="time"
                  defaultValue={time.slice(11, 19)}
                  onChange={(e) =>
                    setUpdate({
                      ...update,
                      date: update.date.slice(0, 11) + e.target.value,
                    })
                  }
                />
              </>
              {/* <button onClick={()=>setEdit(true)}>Edit this session</button> */}
              {exerciseCall.map((exercise) => {
                const filtered = get[exercise].filter(
                  (v) => v.sid === sidVal
                )[0];
                return (
                  <div key={exercise}>
                    <button onClick={() => loseLift(exercise)}>
                      {update?.lostLifts.includes(exercise)
                        ? "Re-introduce "
                        : "Remove "}
                      {exercise[0].toUpperCase() + exercise.slice(1)}
                    </button>{" "}
                    <br />
                    {exercise[0].toUpperCase() + exercise.slice(1)}:
                    {update?.lostLifts.includes(exercise) ? null : (
                      <>
                        {Array(filtered.mass.length)
                          .fill(null)
                          .map((set, setNo) => {
                            return (
                              <div>
                                {" "}
                                Set {setNo + 1}:
                                <label htmlFor={`${exercise}Set${setNo}mass`}>
                                  Mass:
                                </label>
                                <input
                                  id={`${exercise}Set${setNo}mass`}
                                  onChange={(e) => {
                                    setUpdate({
                                      ...update,
                                      lifts: {
                                        ...update.lifts,
                                        [exercise]: {
                                          ...update.lifts[exercise],
                                          mass: [
                                            ...update.lifts[exercise].mass,
                                          ].map((v, i) => {
                                            return i === setNo
                                              ? parseFloat(e.target.value)
                                              : v;
                                          }),
                                        },
                                      },
                                    });
                                  }}
                                  defaultValue={filtered.mass[setNo]}
                                />
                                <label htmlFor={`${exercise}Set${setNo}reps`}>
                                  Reps:
                                </label>
                                <input
                                  id={`${exercise}Set${setNo}reps`}
                                  onChange={(e) => {
                                    setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            reps: [
                                              ...update.lifts[exercise].reps,
                                            ].map((v, i) => {
                                              return i === setNo
                                                ? parseInt(e.target.value)
                                                : v;
                                            }),
                                          },
                                        },
                                      });
                                  }}
                                  defaultValue={filtered.reps[setNo]}
                                />
                              </div>
                            );
                          })}
                        <div>
                          <label htmlFor={`${exercise}mass`}>Mass:</label>
                          <input
                            id={`${exercise}mass`}
                            onChange={(e) => {
                              setUpdate({
                                ...update,
                                lifts: {
                                  ...update.lifts,
                                  [exercise]: {
                                    ...update.lifts[exercise],
                                    mass: parseFloat(e.target.value),
                                  },
                                },
                              });
                            }}
                            defaultValue={filtered.mass}
                          />
                        </div>
                        <div>
                          <label htmlFor={`${exercise}reps`}>Reps:</label>
                          <input
                            id={`${exercise}reps`}
                            onChange={(e) => {
                              setUpdate({
                                ...update,
                                lifts: {
                                  ...update.lifts,
                                  [exercise]: {
                                    ...update.lifts[exercise],
                                    reps: parseInt(e.target.value),
                                  },
                                },
                              });
                            }}
                            defaultValue={filtered.reps}
                          />
                        </div>
                        <div>
                          <label htmlFor={`${exercise}variation`}>
                            Variation:
                          </label>
                          <select
                            id={`${exercise}variation`}
                            onChange={(e) => {
                              setUpdate({
                                ...update,
                                lifts: {
                                  ...update.lifts,
                                  [exercise]: {
                                    ...update.lifts[exercise],
                                    variation: e.target.value,
                                  },
                                },
                              });
                            }}
                            defaultValue={filtered.variation}
                          >
                            <option>{filtered.variation}</option>
                            {variationOptions(exercise, filtered.variation)}
                          </select>
                        </div>
                      </>
                    )}
                    {/* {JSON.stringify(get[v].filter(v => v.sid === sidVal)[0])} */}
                  </div>
                );
              })}
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  const submitUpdate = (update) => {
    if (
      Object.keys(update.lifts).some((v) =>
        Object.values(update.lifts[v]).some((v) => !!v === false)
      ) ||
      Object.keys(update.newLifts).some((v) =>
        Object.values(update.newLifts[v]).some((v) => !!v === false)
      )
    ) {
      setFeedback("Incomplete Forms");
      return;
    }

    axios({
      method: "PUT",
      data: update,
      withCredentials: true,
      url: `http://localhost:3001/sessions/${user.uid}/${edit}`,
    }).then((res) =>
      axios({
        method: "get",
        withCredentials: true,
        url: `http://localhost:3001/sessions/${user.uid}`,
      }).then((res) => {
        setGet(res.data[0]);
        setEdit(0);
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
  };

  function addFieldset(exercise) {
    return (
      <fieldset>
        {" "}
        <div>{exercise}</div>
        <label htmlFor={`${exercise}mass`}>Mass</label>
        <input
          id={`${exercise}mass`}
          onChange={(e) =>
            setUpdate({
              ...update,
              newLifts: {
                ...update.newLifts,
                [exercise]: {
                  ...update.newLifts[exercise],
                  mass: parseFloat(e.target.value),
                },
              },
            })
          }
        />
        <label htmlFor={`${exercise}reps`}>Reps</label>
        <input
          id={`${exercise}reps`}
          onChange={(e) =>
            setUpdate({
              ...update,
              newLifts: {
                ...update.newLifts,
                [exercise]: {
                  ...update.newLifts[exercise],
                  reps: parseInt(e.target.value),
                },
              },
            })
          }
        />
        <label htmlFor={`${exercise}variation`}>Variation</label>
        <select
          id={`${exercise}variation`}
          onChange={(e) =>
            setUpdate({
              ...update,
              newLifts: {
                ...update.newLifts,
                [exercise]: {
                  ...update.newLifts[exercise],
                  variation: e.target.value,
                },
              },
            })
          }
        >
          <option value="">---</option>
          {variationOptions(exercise, "none")}
        </select>
      </fieldset>
    );
  }

  const removeExercise = (exercise) => {
    const newLiftsClone = {};
    Object.keys(update.newLifts)
      .filter((v) => v !== exercise)
      .forEach(
        (v) => (newLiftsClone[v] = Object.assign({}, update.newLifts[v]))
      );
    setUpdate({ ...update, newLifts: newLiftsClone });
  };

  const loseLift = (exercise) => {
    if (!update.lostLifts.includes(exercise)) {
      const liftsClone = {};
      Object.keys(update.lifts)
        .filter((v) => v !== exercise)
        .forEach((v) => (liftsClone[v] = Object.assign({}, update.lifts[v])));
      setUpdate({
        ...update,
        lifts: liftsClone,
        lostLifts: [...update.lostLifts, exercise],
      });
      return;
    } else if (update.lostLifts.includes(exercise)) {
      const lostLiftsClone = [];
      const filtered = get[exercise].filter((v) => v.sid === edit)[0];
      update.lostLifts
        .filter((v) => v !== exercise)
        .forEach((v) => lostLiftsClone.push(v));
      setUpdate({
        ...update,
        lifts: {
          ...update.lifts,
          [exercise]: {
            mass: filtered.mass,
            reps: filtered.reps,
            sets: filtered.sets,
            scheme: filtered.scheme,
            variation: filtered.variation,
          },
        },
        lostLifts: lostLiftsClone,
      });
      return;
    }
  };

  return (
    <div>
      <button onClick={() => setEdit(0)}>Cancel Changes</button>
      <button onClick={() => console.log(update, typeof update.date)}>
        log Update Object
      </button>
      {/* <button onClick={() => console.log(get.date.filter(v=>v.sid === edit)[0].exercises)}>log get Object</button> */}
      <button onClick={() => submitUpdate(update)}>Submit Update</button>
      {!update
        ? null
        : ["deadlift", "squat", "bench"]
            .filter(
              (v) =>
                !get.date.filter((v) => v.sid === edit)[0].exercises.includes(v)
            )
            .map((val) => {
              return (
                <div key={`missing${val}`}>
                  <button
                    onClick={() => {
                      update.newLifts[val]
                        ? removeExercise(val)
                        : setUpdate({
                            ...update,
                            newLifts: {
                              ...update.newLifts,
                              [val]: {
                                mass: null,
                                reps: null,
                                variation: null,
                              },
                            },
                          });
                    }}
                  >
                    {update.newLifts[val] ? `Cancel ` : `Add `}
                    {val.replace(/^\w/, (c) => c.toUpperCase())}
                  </button>
                  {update.newLifts[val] ? addFieldset(val) : null}
                </div>
              );
            })}
      {returnSid(get, [edit])}
      {feedback}
    </div>
  );
}

function ExerciseFieldSets({ exerciseRefs, exArr }) {
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
        />
        {variationOptions(exercise, variationObject[exercise], exerciseRefs)}
        {fields[exercise] ? lengthenArr(fields[exercise], exercise) : null}
      </fieldset>
    );
  });
}
