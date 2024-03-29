import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend, variationObject, exerciseArray } from "./utils/variables";
import Spinner from "./utils/Spinner";

const LOG = "LOG";

function variationOptions(customs, exercise, index, existing) {
  if (!variationObject[exercise][index]) {
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
  setVarFilter,
  windowInfo
}) {
  const [update, setUpdate] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false)
  const [customAdditions, setCustomAdditions] = useState()
  const [extraVarFields, setExtraVarFields] = useState()
  const [templateArrays, setTemplateArrays] = useState()
  const [macroState, setMacroState] = useState({})
  const exerciseRefs = useRef({})
  const macroRefs = useRef({})
  const customRefs = useRef({})
  const listToggleRef = useRef()
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
        .toISOString().slice(0,19)
    const updateObject = {
      lifts: {},
      newLifts: {},
      lostLifts: [],
      date: correctedDate
    };
    const fieldsInitial = {};
    const extraVarFieldsInitial = {}
    const customsObject = {};
    session.exercises.forEach((exercise) => {
      const filtered = get[exercise].find((sess) => sess.sid === edit);
      const deNulledTemplates = filtered.variation_templates.map(temp=> temp.filter(vari=>vari))
      updateObject.lifts[exercise] = {
        mass: filtered.mass,
        reps: filtered.reps,
        variation_templates: deNulledTemplates,
        vars: filtered.vars
      };
      fieldsInitial[exercise] = filtered.mass.length;
      extraVarFieldsInitial[exercise] = deNulledTemplates.map((template, tempNo) => template.length - variationObject[exercise].length)
      

      let customsComb = [];
      get[exercise].forEach((sess) =>
      sess.variation_templates
        .forEach(
          (template) => template.forEach(
          (variation) =>
            !!variation &&                                    
            !variationObject[exercise].flat().includes(variation) && 
            !customsComb.includes(variation) &&               
            customsComb.push(variation)
      ) )
    );
      customsObject[exercise] = customsComb

      
    });
    setFields(fieldsInitial);
    setUpdate(updateObject);
    setExtraVarFields(extraVarFieldsInitial)
    setCustomAdditions(customsObject)
  }, [get, edit]);

  useEffect(() => {
    if (!extraVarFields) return
    const session = get.sessions.find((v) => v.sid === edit)
    const templateArraysUpdate = {}
    session.exercises.forEach((exercise) => {
      templateArraysUpdate[exercise] = templateArray()
      function templateArray() {
        return extraVarFields[exercise].map( (extraFields, tempNo) =>
        Array(variationObject[exercise].length + extraFields) 
          .fill(null)
          .map((val, ind) => {
            if (ind < variationObject[exercise].length) {
              return variationObject[exercise][ind];
            } else {
              if (customAdditions.length) {
                let output = [...customAdditions[exercise]];
                customAdditions.forEach((addition) => {
                  if (!output.includes(addition)) output.push(addition);
                });
                return output;
              }
              return customAdditions[exercise];
            }
          }) )
      }
    })
    setTemplateArrays(templateArraysUpdate)

  }, [customAdditions, edit, extraVarFields, get.sessions] )

  useEffect(() => {
    if (!update) return
    Object.keys(update.lifts).concat(Object.keys(update.newLifts)).forEach(exercise =>{
      let noOfSets = Object.keys(exerciseRefs.current[exercise]).filter(key=>key.includes("set_")).length
      if (fields[exercise] < noOfSets) {
        const numberToDelete = noOfSets - fields[exercise]
        Array(numberToDelete).fill(null).forEach((nothing, index)=>
        delete exerciseRefs.current[exercise][`set_${noOfSets - 1 - index}`])
        return;
      }
      let noOfTemplates = Object.keys(exerciseRefs.current[exercise]).filter(key=>key.includes("template_")).length
      if (extraVarFields[exercise].length < noOfTemplates) {
        delete exerciseRefs.current[exercise][`template_${noOfTemplates - 1}`]
        return;
      }
      extraVarFields[exercise].forEach( (extraFields, tempNo) =>{
        if (exerciseRefs.current[exercise] && exerciseRefs.current[exercise][`template_${tempNo}`])
          {
            let eRLength = Object.keys(exerciseRefs.current[exercise][`template_${tempNo}`]).length
            if (eRLength > variationObject[exercise].length + extraFields){ 
              delete exerciseRefs.current[exercise][`template_${tempNo}`][eRLength - 1]
            } } })
    })
  },[fields, extraVarFields, exerciseRefs, update])

  useEffect(() => {
    setFeedback(null);
  }, [update]);


  function handleMacro(e, exercise, liftString) {
    e.preventDefault()
    var {fields: col, range, number} = macroRefs.current[exercise]
    
    const target = exerciseRefs.current[exercise]
    
    function changeFields(from, to) {
      function rangeSwitch(targetField) {
        if (range.value === "Even") {
          setUpdate({...update, [liftString]: {...update[liftString], 
            [exercise]: {...update[liftString][exercise], 
              [targetField]: update[liftString][exercise][targetField].map((val, setNo) => 
                setNo % 2 === 1 ? parseInt(number.value) : val
              )}}})
          Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) % 2 === 1)
          .forEach((setName)=>{
            target[`set_${setName.slice(4)}`][targetField].value
           = (targetField === "template" ? number.value - 1 : number.value)})
        }
        else if (range.value === "Odd") {
          setUpdate({...update, [liftString]: {...update[liftString], 
            [exercise]: {...update[liftString][exercise], 
              [targetField]: update[liftString][exercise][targetField].map((val, setNo) => 
                setNo % 2 === 0 ? parseInt(number.value) : val
              )}}})
          Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) % 2 === 0)
          .forEach((setName)=>{
            target[`set_${setName.slice(4)}`][targetField].value
           = (targetField === "template" ? number.value - 1 : number.value)})
        }
        else {
          setUpdate({...update, [liftString]: {...update[liftString], 
            [exercise]: {...update[liftString][exercise], 
              [targetField]: update[liftString][exercise][targetField].map((val, setNo) => 
                setNo >= from && setNo <= to ? parseInt(number.value) : val
              )}}})
          Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) <= to && key.slice(4) >= from)
          .forEach((setName)=>{
            target[`set_${setName.slice(4)}`][targetField].value
           = (targetField === "template" ? number.value - 1 : number.value)})
        }
      }

      if (col.value === "Template") {
        if (number.value > Object.keys(target).filter(key=>key.includes("template_")).length) return
        rangeSwitch("template")
      }
      else {
        if (col.value !== "Mass") {
          rangeSwitch("reps")
        }
        if (col.value !== "Reps") {
          rangeSwitch("mass")
        }
      }
    }

    if (range.value === "Range") {
      var {from, to} = macroRefs.current[exercise]
      if (parseInt(to.value) > fields[exercise] || parseInt(to.value) < parseInt(from.value) ) to.value = fields[exercise]
      if (parseInt(from.value) > parseInt(to.value)) from.value = 1
      changeFields(from.value - 1, to.value - 1)
    }
    else {
      changeFields(0, fields[exercise] - 1) 
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
              ).getTime() -
                new Date(
                  get.sessions.find((v) => v.sid === sidVal).date
                ).getTimezoneOffset() * 60 * 1000
            )
          ).toISOString();
          return (
            <div key={sidVal}>
              <div className="date_line">
                <label htmlFor="date">
                  {windowInfo.screenWidth > 780 ? "Date of Session:" : "Date:"}
                </label>
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
                  defaultValue={time.slice(11, 16)}
                  onChange={(e) =>
                    setUpdate({
                      ...update,
                      date: update.date.slice(0, 11) + e.target.value,
                    })
                  }
                />
              </div>
              {exerciseCall.map((exercise) => {

                if (!exerciseRefs.current[exercise]) exerciseRefs.current = {...exerciseRefs.current, [exercise]: {}}
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
                if (!update) return null
                return (
                  <div key={exercise} className="existing_exercise">
                    <div className="top_line">
                    <strong>
                      {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}:
                    </strong>
                    <button onClick={() => loseLift(exercise)}>
                      {update?.lostLifts.includes(exercise)
                        ? "Re-introduce "
                        : "Remove "}
                      {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}
                    </button>
                    </div>
                    {update?.lostLifts.includes(exercise) ? null : (
                      <div>
                        <div className="second_line">
                        <label htmlFor={`${exercise}Sets`}><strong>Sets:</strong>&nbsp;</label>
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
                                    vars: Array(parseInt(e.target.value))
                                      .fill(0)
                                      .map((v, i) =>
                                        update.lifts[exercise].vars[i]
                                          ? update.lifts[exercise].vars[i]
                                          : filtered.vars[i]
                                          ? filtered.vars[i]
                                          : v
                                      ),

                                  },
                                },
                              });
                            }
                          }}
                        />
                        </div>
                        <div className="macro_line_one">
                          <label>
                          Fill&nbsp;
                          <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], fields: e.target.value}})} 
                                  ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {fields: el}}}
                                  defaultValue={macroState[exercise].fields}>
                            <option>Mass</option>
                            <option>Reps</option>
                            <option>Both</option>
                            <option>Template</option>
                          </select>
                          </label>
                          <label>
                          with&nbsp; <input type="number" max="999" min="0" 
                            onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], number: e.target.value}})} 
                            ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], number: el}}}
                            defaultValue={macroState[exercise].number}/>
                          </label>
                          <label>for&nbsp;
                          <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], range: e.target.value}})} 
                                  ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], range: el}}}
                                  defaultValue={macroState[exercise].range}>
                            <option>All</option>
                            <option>Range</option>
                            <option>Even</option>
                            <option>Odd</option>
                          </select>
                          </label>
                          </div>
                          <div className="macro_line_two">
                          { macroState[exercise].range === "Range" && <>
                          {"Sets"}
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
                              <div key={`${exercise}set${setNo}`} className="set_line">
                                <strong>{windowInfo.screenWidth > 715 && "Set "}{setNo + 1}</strong>
                                <label htmlFor={`${exercise}Set${setNo}mass`}>
                                {windowInfo.screenWidth > 840 ? "Mass:" : "M:"}
                                  &nbsp;
                                <input
                                  id={`${exercise}Set${setNo}mass`}
                                  ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                    [exercise]: {...exerciseRefs.current[exercise], 
                                      [`set_${setNo}`]: {...exerciseRefs.current[exercise][`set_${setNo}`], mass: el}}}}
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
                                </label>

                                <label htmlFor={`${exercise}Set${setNo}reps`}>
                                {windowInfo.screenWidth > 840 ? "Reps:" : "R:"}
                                  &nbsp;
                                <input
                                  id={`${exercise}Set${setNo}reps`}
                                  ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                    [exercise]: {...exerciseRefs.current[exercise], 
                                      [`set_${setNo}`]: {...exerciseRefs.current[exercise][`set_${setNo}`], reps: el}}}}
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
                                </label>

                                <label>
                                  {windowInfo.screenWidth > 840 ? "Template:" : "T:"}&nbsp;
                                  <select
                                    defaultValue={update.lifts[exercise].vars[setNo]}

                                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                      [exercise]: {...exerciseRefs.current[exercise], 
                                        [`set_${setNo}`]: {...exerciseRefs.current[exercise][`set_${setNo}`], template: el}}}}
                                    onChange={(e) => setUpdate({
                                      ...update,
                                      lifts: {
                                        ...update.lifts,
                                        [exercise]: {
                                          ...update.lifts[exercise],
                                          vars: update.lifts[exercise].vars
                                          .map((tempNo, ind)=> ind === setNo 
                                            ? parseInt(e.target.value) 
                                            : tempNo)
                                        }
                                      }
                                    }) }>
                                      {
                                      update.lifts[exercise].variation_templates.map((template, tempNo) => 
                                      <option 
                                      key={`${exercise}Set${setNo}Vars_template${tempNo}`} 
                                      value={tempNo}>
                                        {tempNo + 1}
                                      </option>)} 
                                  </select>
                                </label>
                              </div>
                            );
                          })}

                        <div>
                          <div className="template_controls">
                          Variations:
                          <div style={{display: "inline-block"}}>

                            {  extraVarFields[exercise].length < 5 &&
                            <button 
                            onClick={(e) =>{ e.preventDefault(); 
                              setUpdate({...update, lifts: {...update.lifts, 
                                [exercise]: {...update.lifts[exercise], 
                                  variation_templates: [...update.lifts[exercise].variation_templates, Array(variationObject[exercise].length).fill(null) ]
                                }} })
                              setExtraVarFields({...extraVarFields,
                                 [exercise]: [...extraVarFields[exercise], 0]})}}
                            >Add a template
                            </button>}

                            {  extraVarFields[exercise].length > 1 &&
                            <button 
                            onClick={(e) =>{e.preventDefault(); 
                              setUpdate({...update, lifts: {...update.lifts, 
                                [exercise]: {...update.lifts[exercise], 
                                  variation_templates: update.lifts[exercise].variation_templates
                                  .slice(0, update.lifts[exercise].variation_templates.length - 1)
                                }} })
                              setExtraVarFields({...extraVarFields,
                                 [exercise]: extraVarFields[exercise]
                                 .slice(0, extraVarFields[exercise].length - 1)})}}
                            >Subtract a template
                            </button>}

                          </div>
                          </div>
                          <div className="templates_container">
                          {templateArrays && templateArrays[exercise].map((temp, tempNo) => { 
                            return (
                              <div key={`${exercise}template${tempNo}`} className="template_container" style={{display: "inline-block"}}>
                                Template {`${tempNo + 1}`}
                                {update.lifts[exercise].variation_templates[tempNo] 
                                && temp.filter(v=> v !== null).map((variation, varNo) => {
                                  const selectedVariation = update.lifts[exercise].variation_templates[tempNo][varNo]
                                  return (
                                    <div key={`${exercise}_template_${tempNo}_var_${varNo}`}>
                                      <label htmlFor={`${exercise}variation`}>
                                        {varNo + 1}&nbsp;
                                      </label>
                                      <select
                                        id={`${exercise}variation`}
                                        ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                                          [exercise]: {...exerciseRefs.current[exercise], 
                                            [`template_${tempNo}`]: {...exerciseRefs.current[exercise][`template_${tempNo}`], 
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
                                        <option>{selectedVariation}</option>
                                        {variationOptions(customAdditions[exercise], exercise, varNo, selectedVariation)}
                                      </select>
                                    </div>
                                )})}
                                {update.lifts[exercise].variation_templates[tempNo] && update.lifts[exercise].variation_templates[tempNo].length < 5 &&
                                <button onClick={() => {
                                  setUpdate({
                                        ...update,
                                        lifts: {
                                          ...update.lifts,
                                          [exercise]: {
                                            ...update.lifts[exercise],
                                            variation_templates: 
                                              update.lifts[exercise].variation_templates
                                              .map((template, templateIndex) => 
                                              templateIndex === tempNo ? template.concat([""]) : template),
                                          },
                                        },
                                      })
                                  setExtraVarFields({
                                    ...extraVarFields,
                                    [exercise]: extraVarFields[exercise].map((extraFields, index) => 
                                    index === tempNo ? extraFields + 1 : extraFields)
                                  })
                                    }}>+</button>
                                }{update.lifts[exercise].variation_templates[tempNo] && update.lifts[exercise].variation_templates[tempNo].length > variationObject[exercise].length &&
                                <button onClick={()=> {
                                  setUpdate({
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
                                              )} } })
                                  setExtraVarFields({
                                    ...extraVarFields,
                                    [exercise]: extraVarFields[exercise].map((extraFields, index) => 
                                    index === tempNo ? extraFields - 1 : extraFields)
                                  })
                                }}>-</button>}
                              </div>
                          )})}
                        </div>
                        { update.lifts[exercise].variation_templates.some(temp => temp.length > variationObject[exercise].length) &&
                          <div className="custom_line">
                          <label> New Custom Tag:&nbsp;
                            <input type='text' ref={(el) => customRefs.current[exercise] = el}/>
                          </label>
                          <button onClick={() => 
                              setCustomAdditions({...customAdditions, 
                                [exercise]: [...customAdditions[exercise], 
                                  customRefs.current[exercise].value]})}>
                            Add New Variation
                          </button>
                          </div>}
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
    // At least one lift exists in submission //
    if (
      Object.keys(update.lifts).concat(Object.keys(update.newLifts)).length === 0
    ) {
      setFeedback("There must be at least one lift in the session")
      return}
    // Unique timestamp on submission //
    if (
      get.sessions?.filter(sess=> sess.sid !== edit).some((session) => {
        function correctTimezone(dateString) {
          const dateObject = new Date(dateString);
          const correction = dateObject.setTime(
            dateObject.getTime() - 1000 * 60 * dateObject.getTimezoneOffset()
          );
          return new Date(correction).toISOString().slice(0, 19);
        }
        return correctTimezone(session.date) === update.date.slice(0, 19);
      })
    ) {
      setFeedback("A session has already been recorded for this Timestamp");
      return;
    }
    // Valid mass and reps fields check //
    if (
      Object.keys(update.lifts).some((exercise) =>
        Object.keys(update.lifts[exercise])
        .filter(key=>['mass','reps'].includes(key))
        .some((arrayKey) => Object.values(update.lifts[exercise][arrayKey])
        .some((v) => !v && v !== 0)
        )
      ) ||
      Object.keys(update.newLifts).some((exercise) =>
        Object.keys(update.newLifts[exercise]).filter(key=>['mass','reps'].includes(key))
        .some((arrayKey) => Object.values(update.newLifts[exercise][arrayKey])
        .some((v) => !v && v !== 0)
        )
      )
    ) {
      setFeedback("Incomplete Set Information");
      return;
    }
    // Valid template fields check //
    if (
      Object.keys(update.lifts).some((exercise) =>
        update.lifts[exercise].variation_templates
        .some((template) => template.some((v) => v === null || !v.trim())
        )) 
      ||
      Object.keys(update.newLifts).some((exercise) =>
        update.newLifts[exercise].variation_templates
        .some((template) => template.some((v) => v === null || !v.trim())
      ))
    ) {
      setFeedback("Incomplete Template Fields");
      return;
    }
    // Each template is used check //
    if (
      Object.keys(update.lifts).some((exercise) =>
        update.lifts[exercise].variation_templates
        .some((template, tempNo) => !update.lifts[exercise].vars.includes(tempNo)))
      ||
      Object.keys(update.newLifts).some((exercise) =>
        update.newLifts[exercise].variation_templates
        .some((template, tempNo) => !update.newLifts[exercise].vars.includes(tempNo)))
    ) {
      setFeedback(`Every template must be used`)
      return
    }

    // Intra template uniqueness check //
    if ( 
      Object.keys(update.lifts)
        .some(exercise => update.lifts[exercise].variation_templates
        .some((template)=> template.length !== Array.from(new Set(template)).length) )
      || 
      Object.keys(update.newLifts)
        .some(exercise => update.newLifts[exercise].variation_templates
        .some((template)=> template.length !== Array.from(new Set(template)).length) )
      ){
      setFeedback("Cannot submit multiple identical variations")
      return
    }
    // Inter template uniqueness check //
    if (
      Object.keys(update.lifts).some(exercise => update.lifts[exercise].variation_templates
        .some((template, tempNo, tempsArray)=> {
          for (let i = tempNo + 1; i < tempsArray.length; i++) {
            if (template.every(vari => 
              tempsArray[i].includes(vari)) 
              && template.length === tempsArray[i].length) return true
          }
          return false
        } ))
      || 
      Object.keys(update.newLifts).some(exercise => update.newLifts[exercise].variation_templates
        .some((template, tempNo, tempsArray)=> {
          for (let i = tempNo + 1; i < tempsArray.length; i++) {
            if (template.every(vari => 
              tempsArray[i].includes(vari)) 
              && template.length === tempsArray[i].length) return true
          }
          return false
        } ))
      ){
      setFeedback("Cannot submit multiple identical templates")
      return
    }

    const time = new Date(update.date).toISOString()

    const submission = {...update, date: time}
    setLoading(true)

    axios({
      method: "PUT",
      data: submission,
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
      <div className="added_fieldset">
        <div>
          <div className="top_line">
          <strong className="added">
            {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}:
          </strong>
          </div>
          <div className="second_line">
          <label htmlFor={`${exercise}Sets`}><strong>Sets:</strong>&nbsp;</label>
          <input
            id={`${exercise}Sets`}
            placeholder="1"
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
                      vars: Array(parseInt(e.target.value))
                        .fill(0)
                        .map((v, i) =>
                          !update.newLifts[exercise].vars
                            ? v
                            : update.newLifts[exercise].vars[i]
                            ? update.newLifts[exercise].vars[i]
                            : v
                        ),
                    },
                  },
                });
              }
            }}
          />
          </div>
          <div className="macro_line_one">
            <label>
            Fill&nbsp;
            <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], fields: e.target.value}})} 
                    ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {fields: el}}}
                    defaultValue={macroState[exercise].fields}>
              <option>Mass</option>
              <option>Reps</option>
              <option>Both</option>
              <option>Template</option>
            </select>
            </label>
            <label>
            with <input type="number" max="999" min="0" 
              onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], number: e.target.value}})} 
              ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], number: el}}} 
              defaultValue={macroState[exercise].number}/>
            </label>
            <label>for&nbsp;
            <select onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], range: e.target.value}})} 
                    ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], range: el}}}
                    defaultValue={macroState[exercise].range}>
              <option>All</option>
              <option>Range</option>
              <option>Even</option>
              <option>Odd</option>
            </select>
            </label>
          </div>
          <div className="macro_line_two">
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
              if (!exerciseRefs.current[exercise]) exerciseRefs.current = {...exerciseRefs.current, [exercise]: {}}
              return (
                <div key={`${exercise}set${setNo}`} className="set_line">
                  Set {setNo + 1}
                  <label htmlFor={`${exercise}Set${setNo}mass`}>Mass:&nbsp;
                  <input
                    id={`${exercise}Set${setNo}mass`}
                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                      [exercise]: {...exerciseRefs.current[exercise], 
                        [`set_${setNo}`]: {...exerciseRefs.current[exercise][`set_${setNo}`], mass: el}}}}
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            mass: update.newLifts[exercise].mass.map(
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
                  </label>
                  <label htmlFor={`${exercise}Set${setNo}reps`}>Reps:&nbsp;
                  <input
                    id={`${exercise}Set${setNo}reps`}
                    ref={el=> exerciseRefs.current = {...exerciseRefs.current, 
                      [exercise]: {...exerciseRefs.current[exercise], 
                        [`set_${setNo}`]: {...exerciseRefs.current[exercise][`set_${setNo}`], reps: el}}}}
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
                  </label>
                  <label>Template:&nbsp;
                  <select
                    type="number"
                    step="0.25"
                    required
                    ref={(el) =>
                      (exerciseRefs.current = {
                        ...exerciseRefs.current,
                        [exercise]: {
                          ...exerciseRefs.current[exercise],
                          [`set_${setNo}`]: { ...exerciseRefs.current[exercise][`set_${setNo}`], template: el },
                        },
                      })                      
                    }
                    onChange={(e) => {
                      setUpdate({
                        ...update,
                        newLifts: {
                          ...update.newLifts,
                          [exercise]: {
                            ...update.newLifts[exercise],
                            vars: [...update.newLifts[exercise].vars].map(
                              (tempNo, setNumber) => {
                                return setNumber === setNo
                                  ? parseInt(e.target.value)
                                  : tempNo;
                              }
                            ),
                          },
                        },
                      });
                    }}  
                  >{extraVarFields[exercise].map((extraFields, tempNo) => 
                    <option key={`${exercise}Set${setNo}Vars_template${tempNo}`} value={tempNo}>{tempNo + 1}</option> )}
                  </select>
                  </label>
                </div>
              );
            })}

          <div>
            <div className="template_controls">

            Variations:
            <div>
              { extraVarFields[exercise].length < 5 && 
              <button 
              onClick={(e) =>{ 
                e.preventDefault(); 
                setUpdate({...update, newLifts: {...update.newLifts, 
                  [exercise]: {...update.newLifts[exercise], 
                    variation_templates: [...update.newLifts[exercise].variation_templates, Array(variationObject[exercise].length).fill(null) ]
                  }} })

                setExtraVarFields({...extraVarFields, 
                  [exercise]: [...extraVarFields[exercise], 0] })
                }}
              >Add a template</button>
              }
              { extraVarFields[exercise].length > 1 &&
              <button 
              onClick={(e) =>{e.preventDefault(); 
                setUpdate({...update, newLifts: {...update.newLifts, 
                  [exercise]: {...update.newLifts[exercise], 
                    variation_templates: update.newLifts[exercise].variation_templates
                    .slice(0, update.newLifts[exercise].variation_templates.length - 1)
                  }} })
                setExtraVarFields({...extraVarFields, 
                  [exercise]: extraVarFields[exercise]
                  .slice(0, extraVarFields[exercise].length - 1)})}}
              >Subtract a template</button>
              }
            </div>
            </div>

            <div className="templates_container">
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
                        [`template_${tempNo}`]: {...exerciseRefs.current[exercise][`template_${tempNo}`], 
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
                      }}});
                    }}
                  >
                    <option>{v}</option>
                    {variationOptions(customAdditions[exercise], exercise, varNo, v)}
                  </select>
                </div>
              )})}
              
              {update.newLifts[exercise].variation_templates[tempNo].length < 5 &&
                <button onClick={() => {
                  setUpdate({
                    ...update,
                    newLifts: {
                      ...update.newLifts,
                      [exercise]: {
                        ...update.newLifts[exercise],
                        variation_templates: 
                          update.newLifts[exercise].variation_templates
                          .map((template, templateIndex) => 
                            templateIndex === tempNo 
                            ? template.concat([""]) 
                            : template),
                      },
                    },
                  })
                  setExtraVarFields({ ...extraVarFields, 
                    [exercise]: extraVarFields[exercise]
                    .map((extraFields, templateNumber) => 
                      tempNo === templateNumber 
                      ? extraFields + 1 
                      : extraFields)})
                }}>+</button>
                }
                
                { update.newLifts[exercise].variation_templates[tempNo].length > variationObject[exercise].length &&
                <button onClick={()=> {
                  setUpdate({
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
                          )} } })
                  setExtraVarFields({ ...extraVarFields, 
                    [exercise]: extraVarFields[exercise]
                    .map((extraFields, templateNumber) => 
                      tempNo === templateNumber 
                      ? extraFields - 1 
                      : extraFields)})
                  }}>-</button>}
                </div>
              )
            })
            }
            </div>
            {update.newLifts[exercise].variation_templates
              .some(temp => temp.length > variationObject[exercise].length) &&
            <div className="custom_line">
              <label> New Custom Tag:&nbsp;
                <input type='text' ref={(el) => customRefs.current[exercise] = el}/>
              </label>
              <button onClick={() => 
                  setCustomAdditions({...customAdditions, 
                    [exercise]: [...customAdditions[exercise], 
                      customRefs.current[exercise].value]})}>
                Add New Variation
              </button>
            </div>}
          </div>
        </div>

      </div> 
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
    if (get[exercise]) {
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
    setExtraVarFields({...extraVarFields, [exercise]: [0]})
    setUpdate({
      ...update,
      newLifts: {
        ...update.newLifts,
        [exercise]: {
          mass: [null],
          reps: [null],
          variation_templates: Array(1).fill(Array(variationObject[exercise].length).fill('')),
          vars: [0]
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
      const deNulledTemplates = filtered.variation_templates.map(temp=> temp.filter(vari=>vari))
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
            vars: filtered.vars,
            variation_templates: deNulledTemplates,
          },
        },
        lostLifts: lostLiftsClone,
      });
      return;
    }
  };

  const missingSessionExercises = exerciseArray.sort()
    .filter(
      (exercise) =>
        !get.sessions.find((session) => session.sid === edit).exercises.includes(exercise)
    )

  return (
    <div className="edit_page_container">
    <div className="edit_container">
      <div className="top_buttons">
      <button
        onClick={() => {
          setEdit(0); 
          setPage(LOG);
        }}
      >
        {windowInfo.screenWidth > 515 ? "Cancel and go to Log" : "Log"}
      </button>
      <button
        onClick={() => {
          setPage("BREAKDOWN");
        }}
      >
        {windowInfo.screenWidth > 515 ? "Cancel and view Breakdown" : "Breakdown"}
        
      </button>
      </div>
      <button className="submit_button_edit" onClick={() =>submitUpdate(update)}>
      {windowInfo.screenWidth > 515 ? "Submit Update" : "Submit"}

        </button>
      
      {returnSid(get, [edit])}
      {update && Object.keys(update.newLifts).map(exercise => {
        return (
          <div key={`${exercise}NewFieldset`}>
            {addFieldset(exercise)}
          </div>
        )
      })}
    </div>
    {loading &&
    <div className="load_container_edit">
      <Spinner/>
    </div>
    }
    <div className="feedback_container_edit">
      {feedback}
    </div>
    <div className="missing_exercises_container" ref={listToggleRef}>
      <div className="missing_exercises">
      {update && missingSessionExercises
        .map((exercise) => {
          return (
            <div key={`missing${exercise}`} style={{display:"inline-block"}}>
              <button style={{display:"inline-block"}}
                onClick={(e) => { 
                  if (update.newLifts[exercise]) {
                    removeExercise(exercise)
                    e.target.classList.remove("added_lift")
                  }
                  else {
                    addExercise(exercise);
                    e.target.classList.add("added_lift")
                  }
                }}
                >
                {update.newLifts[exercise] ? `Remove ` : `Add `}
                {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
    {windowInfo.scrollPosition > 50 &&
      <div className="return_to_top_edit" onClick={() =>window.scrollTo({top:0, behavior:"smooth"})}>
        <span>{'\u2191'}</span>
      </div>
    }
    <button className="edit_exercise_list_toggle" 
      onClick={()=> listToggleRef.current?.classList.toggle("active")}>
    </button>
    </div>
  );
}
