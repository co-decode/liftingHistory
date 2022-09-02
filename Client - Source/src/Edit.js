import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend, variationObject, exerciseArray } from "./utils/variables";
import Spinner from "./utils/Spinner";

const LOG = "LOG";

function variationOptions(customs, exercise, index, existing) {
  if (!variationObject[exercise][index]) {
    // let variationsForUser = [];
    //         get[exercise].forEach((sess) =>
    //           sess.variation.forEach(
    //             (variation) =>
    //               !variationObject[exercise].flat().includes(variation) &&
    //               !variationsForUser.includes(variation) &&
    //               variationsForUser.push(variation)
    //           )
    //         );
    return customs.filter((v) => v !== existing).map((variation)=> <option key={`${exercise}${index}${variation}`}>{variation}</option>)}
    else return variationObject[exercise][index]
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
  dateFilter,
  varFilter,
  setVarFilter
}) {
  const [update, setUpdate] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false)
  const [customAdditions, setCustomAdditions] = useState()
  const exerciseRefs = useRef({})
  const macroRefs = useRef({})
  const [macroState, setMacroState] = useState({})
  const customRefs = useRef({})
  const link = useNavigate();

  useEffect(() => {
    setLoading(true)
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    }).then((res) => {
      setLoading(false)
      if (!res.data) link("/login");
    });
  }, [link]);

  useEffect(() => {
    const session = get.sessions.find((v) => v.sid === edit)
    const receivedDate = new Date(session.date)
    const correctedDate = new Date(
      receivedDate.setTime(
        receivedDate.getTime() - receivedDate.getTimezoneOffset() * 60 * 1000))
        .toISOString()
    const updateObject = {
      lifts: {},
      newLifts: {},
      lostLifts: [],
      date: correctedDate
    };
    const fieldsInitial = {};
    const customsObject = {};
    session.exercises.forEach((v) => {
      const filtered = get[v].find((v) => v.sid === edit);
      // const largestTemplateLength = Math.max(...filtered.variation_templates.map(template=> template.length))
      /* let variationPart = variationObject[v].length - largestTemplateLength > 0                                
      ? filtered.variation_templates.concat(Array(variationObject[v].length - largestTemplateLength).fill("")) 
      : filtered.variation_templates                   << What was the intention of this? */
      const deNulledTemplates = filtered.variation_templates.map(temp=> temp.filter(vari=>vari))
      updateObject.lifts[v] = {
        mass: filtered.mass,
        reps: filtered.reps,
        variation_templates: deNulledTemplates,
      };
      fieldsInitial[v] = filtered.mass.length;

      let customsComb = [];
      get[v].forEach((sess) =>
      sess.variation_templates
        .forEach(
          (template) => template.forEach(
          (variation) =>
            !!variation &&                                    
            !variationObject[v].flat().includes(variation) && 
            !customsComb.includes(variation) &&               
            customsComb.push(variation)
      ) )
    );
      customsObject[v] = customsComb
    });
    setFields(fieldsInitial);
    setUpdate(updateObject);
    setCustomAdditions(customsObject)
  }, [get, edit ]);

  useEffect(() => {
    setFeedback(null);
  }, [update]);

  function handleMacro(e, exercise, liftString) {
    e.preventDefault()
    var {fields: col, range, number} = macroRefs.current[exercise]
    
    const target = exerciseRefs.current[exercise]
    function changeFields(from, to) {
      if (col.value !== "Mass") {
        Object.keys(target).filter(key=> key !== "variation" && key <= to && key >= from).forEach((setNo)=>{
          setUpdate({...update, [liftString]: {...update[liftString], 
            [exercise]: {...update[liftString][exercise], 
              reps: [...update[liftString][exercise].reps].map((repsVal, ind) => 
                ind >= from && ind <= to ? parseInt(number.value) : repsVal
              )}}})
          target[setNo].reps.value = number.value
        })
      }
      if (col.value !== "Reps") {
        setUpdate({...update, [liftString]: {...update[liftString], 
          [exercise]: {...update[liftString][exercise], 
            mass: [...update[liftString][exercise].mass].map((massVal, ind) => 
              ind >= from && ind <= to ? parseInt(number.value) : massVal
            )}}})
        Object.keys(target).filter(key=> key !== "variation" && key <= to && key >= from).forEach(setNo=> target[setNo].mass.value = number.value)
      }
    }

    if (range.value === "Range") {
      var {from, to} = macroRefs.current[exercise]
      if (to.value > fields[exercise] || to.value <= from.value ) to.value = fields[exercise]
      if (from.value >= to.value) from.value = 1
      changeFields(from.value - 1, to.value - 1) // Only differences between Add component and Edit component
    }
    else {
      changeFields(1 - 1, fields[exercise] - 1) //
    }
  }

  function returnSid(get, sidList) {
    return (
      <div>
        {sidList.map((sidVal) => {
          let exerciseCall = get.sessions.find((v) => v.sid === sidVal)
            .exercises;
          let time = new Date(
            new Date(get.sessions.find((v) => v.sid === sidVal).date).setTime(
              new Date(
                get.sessions.find((v) => v.sid === sidVal).date
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

                

                if (!exerciseRefs.current[exercise]) exerciseRefs.current = {...exerciseRefs.current, [exercise]: {variation: {}}}
                if (!macroState[exercise]) setMacroState({...macroState, [exercise]: {
                  fields: "Mass",
                  range: "All",
                  number: null,
                  from: 1,
                  to: 1
                }})

                const filtered = get[exercise].find(
                  (v) => v.sid === sidVal
                );
                // function variationArray() {
                //   if (filtered.variation.length < variationObject[exercise].length) {
                //     return Array(variationObject[exercise].length).fill(null).map((v,i)=> filtered.variation[i] || "")
                //   }
                //   else return filtered.variation
                // }
                if (!update) return null
                const varArray = update.lifts[exercise]
                  .variation_templates
                  /* .flat()
                  .reduce((acc, vari) => !!vari && !acc.includes(vari) ? [...acc, vari] : acc, []) */
                return (
                  <div key={exercise}>
                    <button onClick={() => loseLift(exercise)}>
                      {update?.lostLifts.includes(exercise)
                        ? "Re-introduce "
                        : "Remove "}
                      {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}
                    </button>{" "}
                    <br />
                    <strong>
                      {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}:
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
                        /><br/>
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
                          <button type="" onClick={e => handleMacro(e,exercise,"lifts")}>Go</button>
                        </div>
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
                                  ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                    [exercise]: {...exerciseRefs.current[exercise], 
                                      [setNo]: {...exerciseRefs.current[exercise][setNo], mass: el}}}}
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
                                  ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                    [exercise]: {...exerciseRefs.current[exercise], 
                                      [setNo]: {...exerciseRefs.current[exercise][setNo], reps: el}}}}
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
                          Variation<div style={{display:"flex"}}>
                          {varArray.map((temp, tempNo) => {
                            return (
                              <div key={`${exercise}template${tempNo}`} style={{display: "inline-block", marginRight:"20px"}}>
                                Template {`${tempNo + 1}`}
                                {temp.filter(v=> v !== null).map((v, varNo) => {
                                  return (
                                    <div key={`${exercise}_template_${tempNo}_var_${varNo}`}>
                                      <label htmlFor={`${exercise}variation`}>
                                        {varNo + 1}
                                      </label>
                                      <select
                                        id={`${exercise}variation`}
                                        ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                          [exercise]: {...exerciseRefs.current[exercise], 
                                            variation: {...exerciseRefs.current[exercise].variation, 
                                            [varNo]: el}}}}
                                        onChange={(e) => {
                                          let newUpdate
                                            newUpdate = {
                                              ...update,
                                              lifts: {
                                                ...update.lifts,
                                                [exercise]: {
                                                  ...update.lifts[exercise],
                                                  variation_templates:
                                                    update.lifts[exercise].variation_templates.map((template, templateIndex)=> 
                                                    templateIndex === tempNo 
                                                    ? template.map((v, i) => 
                                                      i === varNo ? e.target.value : v) 
                                                    : template)
                                                },
                                              },
                                            }
                                          setUpdate(newUpdate);
                                        }}
                                      >
                                        <option>{v}</option>
                                        {variationOptions(customAdditions[exercise], exercise, varNo, v)}
                                      </select>
                                    </div>
                                )})}
                                {update.lifts[exercise].variation_templates[tempNo].length < 5 &&
                                <button onClick={() => setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            variation_templates: 
                                              update.lifts[exercise].variation_templates.map((template, templateIndex) => templateIndex === tempNo ? template.concat([""]) : template),
                                          },
                                        },
                                      })}>+</button>
                                }{ update.lifts[exercise].variation_templates[tempNo].length > variationObject[exercise].length &&
                                <button onClick={()=> setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            variation_templates: update.lifts[exercise]
                                              .variation_templates.map((template, templateIndex) => 
                                                templateIndex === tempNo
                                                ? template.slice(0, update.lifts[exercise].variation_templates[tempNo].length - 1)
                                                : template
                                              )
                                          },
                                        },
                                      })}>-</button>}
                              </div>
                          )})}
                         {/*  { update.lifts[exercise].variation_templates
                           .every(template=> template.length < 5) &&
                          <button onClick={() => setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            variation_templates: [
                                              ...update.lifts[exercise].variation_templates,
                                            ].concat([""]),
                                          },
                                        },
                                      })}>+</button>}
                          { update.lifts[exercise].variation_templates
                           .every(template=> template.length > variationObject[exercise].length) &&
                          <>
                          <button onClick={()=> setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            variation_templates: [
                                              ...update.lifts[exercise].variation_templates,
                                            ].slice(0, update.lifts[exercise].variation_templates.length - 1),
                                          },
                                        },
                                      })}>-</button>*/}
                        </div>{ update.lifts[exercise].variation_templates.some(temp => temp.length > variationObject[exercise].length) &&
                          <><label> New Custom:
                            <input type='text' ref={(el) => customRefs.current[exercise] = el}/>
                          </label>
                          <button onClick={() => 
                              setCustomAdditions({...customAdditions, 
                                [exercise]: [...customAdditions[exercise], 
                                  customRefs.current[exercise].value]})}>
                            Add New Variation
                          </button></>}
                        </div>
                      </div>
                    )}
                  <hr />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  ////

  const submitUpdate = (update) => {
    if (
      Object.keys(update.lifts).some((exercise) =>
        Object.keys(update.lifts[exercise]).some((arrayKey) =>
          Object.values(update.lifts[exercise][arrayKey]).some((v) => !v && v !== 0)
        )
      ) ||
      Object.keys(update.newLifts).some((exercise) =>
        Object.keys(update.newLifts[exercise]).some((arrayKey) =>
          Object.values(update.newLifts[exercise][arrayKey]).some((v) => {console.log(update.newLifts[exercise], exercise, arrayKey, v); return !v && v !== 0})
        )
      )
    ) {
      setFeedback("Incomplete Forms");
      return;
    }
    if (
      Object.keys(update.lifts).some(exercise => update.lifts[exercise].variation.length !== Array.from(new Set(update.lifts[exercise].variation)).length)
      || Object.keys(update.newLifts).some(exercise => update.newLifts[exercise].variation.length !== Array.from(new Set(update.newLifts[exercise].variation)).length)
      ){
      setFeedback("Cannot submit multiple identical variations")
      return
    }
    setLoading(true)

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
        let varFilterAddition = {}
        const newExercises = Object.keys(res.data).filter(key =>!Object.keys(get).includes(key)) 
        newExercises.forEach(exercise => varFilterAddition[exercise] = [])
        setVarFilter({...varFilter, ...varFilterAddition })
        setLoading(false)
        setGet(res.data);
        setEdit(0);
        const earliest = new Date(
          res.data.sessions.map((v) => new Date(v.date)).sort((a, b) => a - b)[0]
        );
        const latest = new Date(
          res.data.sessions.map((v) => new Date(v.date)).sort((a, b) => b - a)[0]
        );
        setDateFilter({
          from: new Date(earliest.setTime(earliest.getTime()))
            .toISOString()
            .slice(0, 10),
          to: new Date(latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000))
            .toISOString()
            .slice(0, 10),
          ascending: dateFilter.ascending,
        });
      }).then(()=>setPage(LOG))
    );
  };

  ///// 

  function addFieldset(exercise) {

    if (!macroState[exercise]) {setMacroState({...macroState, [exercise]: {
      fields: "Mass",
      range: "All",
      number: null,
      from: 1,
      to: 1
    }}); return null}

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
          /><br/>
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
            <button type="" onClick={e => handleMacro(e,exercise,"newLifts")}>Go</button>
          </div>
          {Array(fields[exercise])
            .fill(null)
            .map((set, setNo) => {
              if (!exerciseRefs.current[exercise]) exerciseRefs.current = {...exerciseRefs.current, [exercise]: {variation: {}}}
              return (
                <div key={`${exercise}set${setNo}`}>
                  {" "}
                  Set {setNo + 1} -{" "}
                  <label htmlFor={`${exercise}Set${setNo}mass`}>Mass:</label>
                  <input
                    id={`${exercise}Set${setNo}mass`}
                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                      [exercise]: {...exerciseRefs.current[exercise], 
                        [setNo]: {...exerciseRefs.current[exercise][setNo], mass: el}}}}
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
                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                      [exercise]: {...exerciseRefs.current[exercise], 
                        [setNo]: {...exerciseRefs.current[exercise][setNo], reps: el}}}}
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
            {update.newLifts[exercise].variation_templates.map((temp, tempNo) => {
              return (
                <div key={`${exercise}_template_${tempNo}`}>
                  Template {tempNo + 1}
                {temp.map((v, varNo) => {
              return (
                <div key={`${exercise}_template${tempNo}_var_${varNo}`}>
                  <label htmlFor={`${exercise}variation${varNo}Temp${tempNo}`}>{varNo + 1}</label>
                  <select
                    id={`${exercise}variation${varNo}Temp${tempNo}`}
                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                      [exercise]: {...exerciseRefs.current[exercise], 
                        variation: {...exerciseRefs.current[exercise].variation, 
                        [varNo]: el}}}}
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            variation_templates:
                              update.newLifts[exercise].variation_templates.map((template, templateIndex)=> 
                              templateIndex === tempNo 
                              ? template.map((v, i) => 
                                i === varNo ? e.target.value : v) 
                              : template)
                            /* variation_templates: update.newLifts[exercise].variation_templates.map(
                              (v, i) => {
                                return i === varNo
                                  ? e.target.value
                                  : update.newLifts[exercise].variation[i]}) */
                      }}});
                    }}
                  >
                    <option>{v}</option>
                    {variationOptions(customAdditions[exercise], exercise, varNo, v)}
                  </select>
                </div>
              )})}
              {update.newLifts[exercise].variation_templates[tempNo].length < 5 &&
                <button onClick={() => setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            variation_templates: 
                              update.newLifts[exercise].variation_templates.map((template, templateIndex) => templateIndex === tempNo ? template.concat([""]) : template),
                          },
                        },
                      })}>+</button>
                }{ update.newLifts[exercise].variation_templates[tempNo].length > variationObject[exercise].length &&
                <button onClick={()=> setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            variation_templates: update.newLifts[exercise]
                              .variation_templates.map((template, templateIndex) => 
                                templateIndex === tempNo
                                ? template.slice(0, update.newLifts[exercise].variation_templates[tempNo].length - 1)
                                : template
                              )
                          },
                        },
                      })}>-</button>}
                </div>
              )
            })
            }
            {update.newLifts[exercise].variation_templates
              .some(temp => temp.length > variationObject[exercise].length) &&
            <>
              <label> New Custom:
                <input type='text' ref={(el) => customRefs.current[exercise] = el}/>
              </label>
              <button onClick={() => 
                  setCustomAdditions({...customAdditions, 
                    [exercise]: [...customAdditions[exercise], 
                      customRefs.current[exercise].value]})}>
                Add New Variation
              </button>
            </>}
          </div>
        </div>

      </fieldset> 
    );
  }

  ///////////

  const removeExercise = (exercise) => {
    const newLiftsClone = {};
    Object.keys(update.newLifts)
      .filter((v) => v !== exercise)
      .forEach(
        (v) => (newLiftsClone[v] = Object.assign({}, update.newLifts[v]))
      );
    setUpdate({ ...update, newLifts: newLiftsClone });
  };

  const addExercise = (exercise) => {
    let customsComb = []
    if (get[exercise]){
    get[exercise].forEach((sess) =>
      sess.variation_templates.forEach(template=> template.forEach(
        (variation) =>
          variation &&
          !variationObject[exercise].flat().includes(variation) &&
          !customsComb.includes(variation) &&
          customsComb.push(variation)
      ))
    )}
    setCustomAdditions({...customAdditions, [exercise]: customsComb})
    setUpdate({
      ...update,
      newLifts: {
        ...update.newLifts,
        [exercise]: {
          mass: null,
          reps: null,
          variation_templates: Array(1).fill(Array(variationObject[exercise].length).fill('')),
        },
      },
    })
  }

  /////

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
      const filtered = get[exercise].find((v) => v.sid === edit);
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
      <button onClick={() => console.log(exerciseRefs.current)}>log exerciseRefs</button><br/>
      <button onClick={() => console.log(update)}>log Update</button><br/>
      <button onClick={() => submitUpdate(update)}>Submit Update</button><br/>
      {update && exerciseArray
            .filter(
              (v) =>
                !get.sessions.find((v) => v.sid === edit).exercises.includes(v)
            )
            .map((exercise) => {
              return (
                <div key={`missing${exercise}`} style={{display:"inline-block"}}>
                  <button style={{display:"inline-block"}}
                    onClick={() => { 
                      update.newLifts[exercise]
                        ? removeExercise(exercise)
                        : addExercise(exercise);
                    }}
                  >
                    {update.newLifts[exercise] ? `Remove ` : `Add `}
                    {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}
                  </button>
                  {update.newLifts[exercise] && addFieldset(exercise)}
                </div>
              );
            })}
      {returnSid(get, [edit])}
      {feedback}
      {loading && <Spinner/>}
    </div>
  );
}
