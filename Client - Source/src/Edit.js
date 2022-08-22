import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend } from "./utils/variables";

const LOG = "LOG";

function variationOptions(exercise, index, existing) {
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
  return variationObject[exercise][index]
    .filter((v) => v !== existing)
    .map((v) => <option key={`${exercise}${index}${v}`}>{v}</option>);
}

export default function Edit({
  get,
  setGet,
  edit,
  setEdit,
  setPage,
  user,
  setDateFilter,
}) {
  const [update, setUpdate] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fields, setFields] = useState({});
  const link = useNavigate();

  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    }).then((res) => {
      if (!res.data) link("/login");
    });
  }, [link]);

  useEffect(() => {
    const session = get.date.filter((v) => v.sid === edit)[0];
    const updateObject = {
      lifts: {},
      newLifts: {},
      lostLifts: [],
      date: session.date,
    };
    const fieldsInitial = {};
    session.exercises.forEach((v) => {
      const filtered = get[v].filter((v) => v.sid === edit)[0];
      updateObject.lifts[v] = {
        mass: filtered.mass,
        reps: filtered.reps,
        variation: filtered.variation,
      };
      fieldsInitial[v] = filtered.mass.length;
    });
    setFields(fieldsInitial);
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
                    <strong>
                      {exercise[0].toUpperCase() + exercise.slice(1)}:
                    </strong>
                    {update?.lostLifts.includes(exercise) ? null : (
                      <div>
                        <label htmlFor={`${exercise}Sets`}>Sets:</label>
                        <input
                          id={`${exercise}Sets`}
                          placeholder={filtered.mass.length}
                          onChange={(e) => {
                            if (e.target.value >= 1 && e.target.value <= 20) {
                              setFields({
                                ...fields,
                                [exercise]: parseInt(e.target.value),
                              });
                              setUpdate({
                                ...update,
                                lifts: {
                                  ...update.lifts,
                                  [exercise]: {
                                    ...update.lifts[exercise],
                                    mass: Array(parseInt(e.target.value))
                                      .fill(null)
                                      .map((v, i) =>
                                        update.lifts[exercise].mass[i]
                                          ? update.lifts[exercise].mass[i]
                                          : filtered.mass[i]
                                          ? filtered.mass[i]
                                          : v
                                      ),
                                    reps: Array(parseInt(e.target.value))
                                      .fill(null)
                                      .map((v, i) =>
                                        update.lifts[exercise].reps[i]
                                          ? update.lifts[exercise].reps[i]
                                          : filtered.reps[i]
                                          ? filtered.reps[i]
                                          : v
                                      ),
                                  },
                                },
                              });
                            }
                          }}
                        />
                        {Array(fields[exercise])
                          .fill(null)
                          .map((set, setNo) => {
                            return (
                              <div key={`${exercise}set${setNo}`}>
                                {" "}
                                Set {setNo + 1} -{" "}
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
                          {" "}
                          Variation
                          {filtered.variation.map((v, varNo) => {
                            return (
                              <div key={`${exercise}var${varNo}`}>
                                <label htmlFor={`${exercise}variation`}>
                                  {varNo + 1}
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
                                          variation: [
                                            ...update.lifts[exercise].variation,
                                          ].map((v, i) => {
                                            return i === varNo
                                              ? e.target.value
                                              : v;
                                          }),
                                        },
                                      },
                                    });
                                  }}
                                  defaultValue={filtered.variation[varNo]}
                                >
                                  <option>{filtered.variation[varNo]}</option>
                                  {variationOptions(exercise, varNo, v)}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
      Object.keys(update.lifts).some((exercise) =>
        Object.keys(update.lifts[exercise]).some((arrayKey) =>
          Object.values(update.lifts[exercise][arrayKey]).some((v) => !v)
        )
      ) ||
      Object.keys(update.newLifts).some((exercise) =>
        Object.values(update.newLifts[exercise]).some((arrayKey) =>
          Object.values(update.newLifts[exercise][arrayKey]).some((v) => !v)
        )
      )
    ) {
      setFeedback("Incomplete Forms");
      return;
    }

    axios({
      method: "PUT",
      data: update,
      withCredentials: true,
      url: `${backend}/sessions/${user.uid}/${edit}`,
    }).then((res) =>
      axios({
        method: "get",
        withCredentials: true,
        url: `${backend}/sessions/${user.uid}`,
      }).then((res) => {
        setGet(res.data[0]);
        setEdit(0);
        setPage(LOG)
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
    const variationObject = {
      deadlift: ["", ""],
      squat: [""],
      bench: ["", ""],
    };
    return (
      <fieldset>
        <div>
          <label htmlFor={`${exercise}Sets`}>Sets:</label>
          <input
            id={`${exercise}Sets`}
            onChange={(e) => {
              if (e.target.value >= 1 && e.target.value <= 20) {
                setFields({ ...fields, [exercise]: parseInt(e.target.value) });
                setUpdate({
                  ...update,
                  newLifts: {
                    ...update.newLifts,
                    [exercise]: {
                      ...update.newLifts[exercise],
                      mass: Array(parseInt(e.target.value))
                        .fill(null)
                        .map((v, i) =>
                          !update.newLifts[exercise].mass
                            ? v
                            : update.newLifts[exercise].mass[i]
                            ? update.newLifts[exercise].mass[i]
                            : v
                        ),
                      reps: Array(parseInt(e.target.value))
                        .fill(null)
                        .map((v, i) =>
                          !update.newLifts[exercise].reps
                            ? v
                            : update.newLifts[exercise].reps[i]
                            ? update.newLifts[exercise].reps[i]
                            : v
                        ),
                    },
                  },
                });
              }
            }}
          />
          {Array(fields[exercise])
            .fill(null)
            .map((set, setNo) => {
              return (
                <div key={`${exercise}set${setNo}`}>
                  {" "}
                  Set {setNo + 1} -{" "}
                  <label htmlFor={`${exercise}Set${setNo}mass`}>Mass:</label>
                  <input
                    id={`${exercise}Set${setNo}mass`}
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            mass: [...update.newLifts[exercise].mass].map(
                              (v, i) => {
                                return i === setNo
                                  ? parseFloat(e.target.value)
                                  : v;
                              }
                            ),
                          },
                        },
                      });
                    }}
                  />
                  <label htmlFor={`${exercise}Set${setNo}reps`}>Reps:</label>
                  <input
                    id={`${exercise}Set${setNo}reps`}
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            reps: [...update.newLifts[exercise].reps].map(
                              (v, i) => {
                                return i === setNo
                                  ? parseInt(e.target.value)
                                  : v;
                              }
                            ),
                          },
                        },
                      });
                    }}
                  />
                </div>
              );
            })}

          <div>
            {" "}
            Variation
            {variationObject[exercise].map((v, varNo) => {
              return (
                <div key={`${exercise}var${varNo}`}>
                  <label htmlFor={`${exercise}variation`}>{varNo + 1}</label>
                  <select
                    id={`${exercise}variation`}
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            variation: [...variationObject[exercise]].map(
                              (v, i) => {
                                return i === varNo
                                  ? e.target.value
                                  : update.newLifts[exercise].variation[i];
                              }
                            ),
                          },
                        },
                      });
                    }}
                  >
                    <option value=""> --- </option>
                    {variationOptions(exercise, varNo, v)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
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
      <button
        onClick={() => {
          setEdit(0);
          setPage(LOG);
        }}
      >
        Cancel and go to Log
      </button>
      <button
        onClick={() => {
          setPage("BREAKDOWN");
        }}
      >
        Cancel and view Breakdown
      </button>
      {/* <button onClick={() => console.log(update, typeof update.date)}>
        log Update Object
      </button> */}
      {/* <button onClick={() => console.log(get.date.filter(v=>v.sid === edit)[0].exercises)}>log get Object</button> */}
      <button onClick={() => submitUpdate(update)}>Submit Update</button>
      {!update
        ? null
        : ["deadlift", "squat", "bench"]
            .filter(
              (v) =>
                !get.date.filter((v) => v.sid === edit)[0].exercises.includes(v)
            )
            .map((exercise) => {
              return (
                <div key={`missing${exercise}`}>
                  <button
                    onClick={() => {
                      update.newLifts[exercise]
                        ? removeExercise(exercise)
                        : setUpdate({
                            ...update,
                            newLifts: {
                              ...update.newLifts,
                              [exercise]: {
                                mass: null,
                                reps: null,
                                variation: [],
                              },
                            },
                          });
                    }}
                  >
                    {update.newLifts[exercise] ? `Cancel ` : `Add `}
                    {exercise.replace(/^\w/, (c) => c.toUpperCase())}
                  </button>
                  {update.newLifts[exercise] ? addFieldset(exercise) : null}
                </div>
              );
            })}
      {returnSid(get, [edit])}
      {feedback}
    </div>
  );
}
