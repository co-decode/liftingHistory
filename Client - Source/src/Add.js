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
  windowInfo,
}) {
  const dateRefs = useRef({ date: null, time: null });
  const exerciseRefs = useRef({});
  const fileRef = useRef();
  const [blob, setBlob] = useState();
  const [exArr, setExArr] = useState([]);
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState(null);
  const [redirect, setRedirect] = useState(true);
  const [loading, setLoading] = useState(false);
  const link = useNavigate();

  useEffect(() => {
    setLoading(true)
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    }).then((res) => {
      if (!res.data) link("/login");
      else if (res.data) {
        setLoading(false)
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
          parseInt(timePart.slice(3, 5)) * 60000 +
          new Date(datePart).getTimezoneOffset() * 60 * 1000
      )
    ).toISOString();


    const lifts = {};
    exArr.forEach((exercise) => {
      let repArray = [];
      let massArray = [];
      let varArray = [];
      let tagArray = []

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
          tagArray = [
            ...tagArray,
            parseInt(exerciseRefs.current[exercise][val].template.value)
          ]
        }
      });
      Object.keys(exerciseRefs.current[exercise]).filter(key => key.includes("template_"))
      .forEach((keyName, tempNo) =>{ 
        varArray = [...varArray, []]
          Object.values(exerciseRefs.current[exercise][`template_${tempNo}`])
          .forEach((varEl, varNo) => {
              
            varArray = varArray.map((templateArray, tempInd) => tempNo === tempInd 
              ? [...templateArray, varEl.value]
              : templateArray)
              /* varArray = varArray.map((templateArray, tempInd) => tempNo === tempInd 
                ? [...templateArray, exerciseRefs.current[exercise][`template_${tempNo}`][varNo].value]
                : templateArray) */
             
            }
          )});
      lifts[exercise] = {
        mass: massArray,
        reps: repArray,
        vars: tagArray,
        variation_templates: varArray,
      };
    });


    // Each template is used check //
    if (
      Object.keys(lifts).some((exercise) =>
        lifts[exercise].variation_templates
        .some((template, tempNo) => !lifts[exercise].vars.includes(tempNo)))
    ) {
      setResponse(`Every template must be used`)
      return
    }

    // Intra template uniqueness check //
    if ( 
      Object.keys(lifts)
        .some(exercise => lifts[exercise].variation_templates
        .some((template)=> template.length !== Array.from(new Set(template)).length) )
      ){
      setResponse("Cannot submit multiple identical variations")
      return
    }
    // Inter template uniqueness check //
    if (
      Object.keys(lifts).some(exercise => lifts[exercise].variation_templates
        .some((template, tempNo, tempsArray)=> {
          for (let i = tempNo + 1; i < tempsArray.length; i++) {
            if (template.every(vari => 
              tempsArray[i].includes(vari)) 
              && template.length === tempsArray[i].length) return true
          }
          return false
        } ))
      ){
      setResponse("Cannot submit multiple identical templates")
      return
    }
    // Unique timestamp check //
    if (
      get.sessions?.some((session) => {
        // function correctTimezone(dateString) {
        //   const dateObject = new Date(dateString);
        //   const correction = dateObject.setTime(
        //     dateObject.getTime() - 1000 * 60 * dateObject.getTimezoneOffset()
        //   );
        //   return new Date(correction).toISOString().slice(0, 19);
        // }
        // console.log(session.date.slice(0,19), "=", time.slice(0,19))
        return session.date.slice(0,19) === time.slice(0, 19);
      })
    ) {
      setResponse("A session has already been recorded for this Timestamp");
      return;
    }

    const submission = { date: time, lifts };
    // console.log(time, new Date(time))

    if (Object.keys(submission.lifts).length > 0) {
      post(submission);
      // console.log("post")
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

  // if (!user)
  //   return (
  //     <>
  //       <strong>Loading...</strong>
  //       <Spinner />
  //     </>
  //   );

  return (
    <>
    <div className="exercise_list_container">

      <div className="exercise_list">
      <ExerciseAdd exArr={exArr} setExArr={setExArr} />
      </div>
    </div>
    <div className="add_container">
      {/* <label>
        Redirect on submit
        <input
          type="checkbox"
          onChange={(e) => setRedirect(e.target.checked)}
        />
      </label> */}
      <form
        onKeyDown={(e) => e.code === "Enter" && e.preventDefault()}
        onSubmit={(e) => handleSubmit(e)}
      >
        {/* <label>
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
        <button onClick={() => readFile()}>Output file read</button> */}
        {/* <div>{!!blob && console.log(JSON.parse(blob))}</div> */}
        <DateInput dateRefs={dateRefs} />
        <ExerciseFieldSets
          exerciseRefs={exerciseRefs}
          exArr={exArr}
          get={get}
          blob={blob}
        />

        {exArr.length ? (
          <button className="add_submit" tabIndex={61} type="submit">Submit</button>
        ) : (
          <div>Add an exercise!</div>
        )}
      </form>
      {windowInfo.scrollPosition > 50 &&
      <div className="return_to_top add_component" 
        onClick={() =>window.scrollTo({top:0, behavior:"smooth"})}>
        <span>{'\u2191'}</span>
      </div>}
      {response && 
      <div className="feedback_container_add">
        {response}
      </div>
      }
      {loading && <div className="add_spinner"><Spinner /></div>}
    </div>
    </>
  );
}

function VariationOptions({
  get,
  exercise,
  exerciseRefs,
  fields,
  varFields,
  setVarFields,
  customs,
}) {
  const customRef = useRef({});

  const [customAdditions, setCustomAdditions] = useState(customs);
  const number = variationObject[exercise].length;
  const [array, setArray] = useState(() =>
    varFields[exercise].map( (extraFields) =>
      Array(number + extraFields) //
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
        }) )
  );
  if (!exerciseRefs.current[exercise]) exerciseRefs.current = {...exerciseRefs.current, [exercise]: {}}

  let checkChange = exerciseRefs.current[exercise]

  useEffect(() => {
    let noOfSets = Object.keys(exerciseRefs.current[exercise]).filter(key=>key.includes("set_")).length
    if (fields[exercise] < noOfSets) {
      const numberToDelete = noOfSets - fields[exercise]
      Array(numberToDelete).fill(null).forEach((nothing, index)=>
      delete exerciseRefs.current[exercise][`set_${noOfSets - 1 - index}`])
      return;
    }
    let noOfTemplates = Object.keys(exerciseRefs.current[exercise]).filter(key=>key.includes("template_")).length
    if (varFields[exercise].length < noOfTemplates) {
      delete exerciseRefs.current[exercise][`template_${noOfTemplates - 1}`]
      return;
    }
    varFields[exercise].forEach( (extraFields, tempNo) =>{
        if (exerciseRefs.current[exercise] && exerciseRefs.current[exercise][`template_${tempNo}`])
          {
            let eRLength = Object.keys(exerciseRefs.current[exercise][`template_${tempNo}`]).length
          if (eRLength > variationObject[exercise].length + extraFields){ 
            delete exerciseRefs.current[exercise][`template_${tempNo}`][eRLength - 1]
          }}
        })

  },[fields, varFields, exercise, exerciseRefs, checkChange])

  useEffect(
    () =>{
      setArray(
        varFields[exercise].map( (extraFields) =>{
          
        return Array(number + extraFields) //
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
          }) })
      )
    },
    [varFields, exercise, number, customAdditions, customs]
  );
  return (
    <div className="template_container">
      {array.map((template, tempNo) => { 
        return (
          <div className="template_line" key={`${exercise}Template${tempNo}`}>
            Template {tempNo + 1}
          <div className="tag_container">
          {template.map((variations, varNo) => 
          <div
            style={{ display: "inline-block" }}
            key={`${exercise}Template${tempNo}VariationDiv${varNo}`}
          >
            <label htmlFor={`${exercise}Template${tempNo}Variation${varNo}`}>
              {varNo === 0 ? "Tag " : null}
              {varNo + 1}:
            </label>
            <select
              id={`${exercise}Template${tempNo}Variation${varNo}`}
              tabIndex={61}
              required
              ref={(el) => exerciseRefs.current = {
                  ...exerciseRefs.current,
                  [exercise]: {
                    ...exerciseRefs.current[exercise],
                    [`template_${tempNo}`]: {
                      ...exerciseRefs.current[exercise][`template_${tempNo}`],
                      [varNo]: el
                    } 
                  },
                }
              }
            >
              <option value=""> --- </option>
              {variations.map(vari => <option key={`${exercise}Template${tempNo}varSet${varNo}Option${vari}`}>{vari}</option>
              )}
            </select>
          </div>)
          }
          {varFields[exercise][tempNo] < 3 && (
            <button
            type="button"
            tabIndex={61}
              onClick={() =>
                setVarFields({ ...varFields, [exercise]: varFields[exercise]
                  .map((extraFieldsForTemplate, tempInd) => tempInd === tempNo ? extraFieldsForTemplate + 1 : extraFieldsForTemplate)})
              }
            >
              +
            </button> 
          )}
          {varFields[exercise][tempNo] > 0 && (
            <button
              type="button"
              tabIndex={61}
              onClick={() =>{
                  setVarFields({ ...varFields, [exercise]: varFields[exercise]
                    .map((extraFieldsForTemplate, tempInd) => tempInd === tempNo ? extraFieldsForTemplate - 1 : extraFieldsForTemplate)})
                    }
                /* = {
                  ...exerciseRefs.current,
                  [exercise]: {
                    ...exerciseRefs.current[exercise],
                    [tempNo]: {
                      ...exerciseRefs.current[exercise][tempNo],
                      [varNo]: el
                    } 
                  },
                }
              } */}
            >
              -
            </button>
          )} 
            </div>
          </div>
        );
      })}
      
      {!!varFields[exercise] && (
        <div className="custom_container">
          <label>
            Custom tag{" "}
            <input 
              type="text"  
              tabIndex={61} 
              className="variation" 
              placeholder="Variation" 
              ref={customRef} />
          </label>
          <button
            type="button" 
            tabIndex={61}
            onClick={() =>
              customRef.current.value &&
              !customAdditions.includes(customRef.current.value) &&
              setCustomAdditions([...customAdditions, customRef.current.value])
            }
          >
            Add Custom Tag
          </button>
        </div>
      )}
    </div>
  );
}

function ExerciseAdd({ exArr, setExArr }) {
  return (
    <>
      {exerciseArray.sort().map((exercise, i) => {
        return (
          <div style={{display:"flex", justifyContent:"space-between"}} key={`${exercise}Add`}>
            <label htmlFor={`${exercise}Add`}>
              {exercise
                .split("_")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}
              :{" "}
            </label>
            <input style={{marginRight:"10px"}}
              id={`${exercise}Add`}
              tabIndex={62}
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

function ExerciseFieldSets({ exerciseRefs, exArr, get, blob }) {
  const [fields, setFields] = useState({});
  const macroRefs = useRef()
  const [macroState, setMacroState] = useState({})
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
          varObject[ex] = [0];
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
  }, [exArr, fields, varFields, customs, get, exerciseRefs]);

  

  const lengthenArr = (number, exercise) => {
    const arr = Array(0);
    arr.length = number;
    arr.fill(null);
    return arr.map((v, i) => (
      <div className="set_line" key={`${exercise}${i}`}>
        <strong>Set {i+1}: </strong>
        <label>Mass&nbsp;
        <input
          id={`${exercise}Set${i}Mass`}
          type="number"
          max="999"
          step="0.25"
          tabIndex={1 + i}
          required
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                [`set_${i}`]: { ...exerciseRefs.current[exercise][`set_${i}`], mass: el },
              },
            })
          }
        /></label>
        <label>Reps&nbsp;
        <input
          id={`${exercise}Set${i}Reps`}
          type="number"
          max="999"
          step="0.25"
          tabIndex={21 + i}
          required
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                [`set_${i}`]: { ...exerciseRefs.current[exercise][`set_${i}`], reps: el },
              },
            })
          }
        /></label>
        <label>Template&nbsp;
        <select
          id={`${exercise}Set${i}Vars`}
          type="number"
          step="0.25"
          tabIndex={41 + i}
          required
          ref={(el) =>
            (exerciseRefs.current = {
              ...exerciseRefs.current,
              [exercise]: {
                ...exerciseRefs.current[exercise],
                [`set_${i}`]: { ...exerciseRefs.current[exercise][`set_${i}`], template: el },
              },
            })
          }
        >{varFields[exercise].map((extraFields, tempNo) => 
          <option key={`${exercise}Set${i}Vars_template${tempNo}`} value={tempNo}>{tempNo + 1}</option> )}
        </select></label>
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
    function addSubtractTemplates() {
      return (
        <div>{ varFields[exercise].length < 5 &&
          <button tabIndex={61} onClick={(e) =>{ e.preventDefault(); setVarFields({...varFields, [exercise]: [...varFields[exercise], 0]})}}>Add a template</button>}
          { varFields[exercise].length > 1 &&
          <button tabIndex={61} onClick={(e) =>{e.preventDefault(); setVarFields({...varFields, [exercise]: varFields[exercise].slice(0, varFields[exercise].length - 1)})}}>Subtract a template</button>}
        </div>
      )
    }

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
          setFields({ ...fields, [exercise]: readFields /* sets */ });
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

                  /* get[exercise].find(
                      (v) => v.sid === mostRecentExerciseSessionSID
                    ).mass[key - 1]; */
                  exerciseRefs.current[exercise][key].reps.value =
                    readSets[key].reps;

                  /* get[exercise].find(
                      (v) => v.sid === mostRecentExerciseSessionSID
                    ).reps[key - 1]; */
                }
              });
              Object.keys(exerciseRefs.current[exercise].variation).forEach(
                (index) => {
                  exerciseRefs.current[exercise].variation[index].value =
                    readVariation[index];

                  /* get[exercise]   
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
        function rangeSwitch(targetField) {
          if (range.value === "Even") {
            Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) % 2 === 1)
            .forEach((setName)=>target[`set_${setName.slice(4)}`][targetField].value
             = (targetField === "template" ? number.value - 1 : number.value))
          }
          else if (range.value === "Odd") {
            Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) % 2 === 0)
            .forEach((setName)=>target[`set_${setName.slice(4)}`][targetField].value
             = (targetField === "template" ? number.value - 1 : number.value))
          }
          else {
            Object.keys(target).filter((key)=> key.includes("set_") && key.slice(4) <= to && key.slice(4) >= from)
            .forEach((setName)=>target[`set_${setName.slice(4)}`][targetField].value
             = (targetField === "template" ? number.value - 1 : number.value))
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
        changeFields(0, fields[exercise] - 1 )
      }
    }

    return (
      <div
        className="exercise_fieldset"
        key={`${exercise}FieldSet`}
      >
      {/* <button onClick={()=>console.log(JSON.stringify(varFields), exerciseRefs.current, fields)}>log varFields</button> */}

        <div style={{ fontWeight: "bold" }}>
          <h1>{exercise
            .split("_")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}</h1>
        </div>
        <label htmlFor={`${exercise}Sets`}>Sets&nbsp;
        <input
          id={`${exercise}Sets`}
          tabIndex={1}
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
          </label>
          {!fields[exercise] && <h3>Add a Set!</h3>}

        
        {!!fields[exercise] && (
          <div className="number_container">
            <div className="macro_container">
              <div className="top_line"> 
                Fill&nbsp;
              <select style={{width:"9ch"}} tabIndex={1} 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], fields: e.target.value}})} 
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {fields: el}}}
                defaultValue={macroState[exercise].fields}>
                <option>Mass</option>
                <option>Reps</option>
                <option>Both</option>
                <option>Template</option>
              </select>
                &nbsp;with&nbsp;
              <input type="number" max="999" min="0"  tabIndex={1} 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], number: e.target.value}})} 
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], number: el}}} style={{ width: "5ch", textIndent: "0.5ch" }} 
                defaultValue={macroState[exercise].number}/>
                &nbsp;for&nbsp;
              <select style={{width:"7ch"}} tabIndex={1} 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], range: e.target.value}})} 
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], range: el}}}
                defaultValue={macroState[exercise].range}>
                <option>All</option>
                <option>Range</option>
                <option>Even</option>
                <option>Odd</option>
              </select>
              </div> 
              <div className="bottom_line"> 
              { macroState[exercise].range === "Range" && <div>
              {"Sets "}
              <input type="number" max="20" min="0"  tabIndex={1} 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], from: e.target.value}})}
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], from: el}}} style={{ width: "5ch" }} 
                defaultValue={macroState[exercise].from}/>
                &nbsp;to&nbsp;
              <input type="number" max="20" min="0"  tabIndex={1} 
                onChange={(e) => setMacroState({...macroState, [exercise]: {...macroState[exercise], to: e.target.value}})}
                ref={(el) => macroRefs.current = {...macroRefs.current, [exercise]: {...macroRefs.current[exercise], to: el}}} style={{ width: "5ch" }} 
                defaultValue={macroState[exercise].to}/>
                &nbsp;
              </div>}
              <button type="button"  tabIndex={1} onClick={(e)=> handleMacro(e)}>Apply</button>
              </div>
            </div>
            {lengthenArr(fields[exercise], exercise)}
          </div>
        )}

        {varFields && varFields[exercise] !== undefined && (
          <VariationOptions
            get={get}
            exercise={exercise}
            fields={fields}
            varFields={varFields}
            setVarFields={setVarFields}
            /* variationObject[exercise] */ exerciseRefs={exerciseRefs}
            customs={customs[exercise]}
          />
        )}{" "}
        {varFields && varFields[exercise] && addSubtractTemplates()}
        {/* {returnTemplateButton()} */}
      </div>
    );
  });
}

function DateInput({ dateRefs }) {
  return (
    <div className="date_container">
      <label htmlFor="date"><h1>Date of Session</h1></label>
      <input  
        id="date"
        tabIndex={1}
        type="date"
        defaultValue={new Date(
          Date.now() - 1000 * 60 * new Date(Date.now()).getTimezoneOffset()
        )
          .toISOString()
          .slice(0, 10)}
        ref={(el) => (dateRefs.current = { ...dateRefs.current, date: el })}
      />
      &nbsp;
      <input
      style={{width: "11.5ch", textAlign:"center"}}
        tabIndex={1}
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
    </div>
  );
}
