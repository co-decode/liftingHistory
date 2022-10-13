import React, { useRef, useState } from "react";
import Graph from "./Graph";
import returnTonnage from "./utils/tonnageFunctions";
// import { variationObject } from "./utils/variables";

export default function Tonnage({ get, tonnagePage, setTonnagePage, windowInfo }) {
  // const [page, setPage] = useState("TABLE");
  const [interval, setInterval] = useState(null);
  const [intervalLength, setIntervalLength] = useState([null, null]);
  const [referenceDate, setReferenceDate] = useState(null);
  const exercisesForUser = Object.keys(get).filter((key) => key !== "sessions");
  function initialFilter() {
    let output = {};
    exercisesForUser.forEach((exercise) => (output[exercise] = []));
    return output;
  }
  const [variationFilter, setVariationFilter] = useState(initialFilter());
  // const [showVariationFilter, setShowVariationFilter] = useState(false)
  const [variationMenus, setVariationMenus] = useState({});
  const checkRefs = useRef({});
  const sidebarRef = useRef();

  /* function returnPageButtons() {
    return (
      <>
        <button
          onClick={() =>
            tonnagePage === "TABLE"
              ? setTonnagePage("GRAPH")
              : setTonnagePage("TABLE")
          }
        >
          {tonnagePage === "TABLE" ? `View Graph` : `View Table`}
        </button>
      </>
    );
  } */

  function returnTable() {
    function handleHideAll() {
      let newVariationFilter = {};
      if (
        exercisesForUser.every((exercise) =>
          variationFilter[exercise].includes("HIDE")
        )
      ) {
        exercisesForUser.forEach(
          (exercise) => (newVariationFilter[exercise] = [])
        );
      } else {
        exercisesForUser.forEach(
          (exercise) => (newVariationFilter[exercise] = ["HIDE"])
        );
        let newVariationMenus = { ...variationMenus };
        Object.keys(newVariationMenus).forEach(
          (exercise) =>
            (newVariationMenus = { ...newVariationMenus, [exercise]: false })
        );
        setVariationMenus(newVariationMenus);
      }
      setVariationFilter(newVariationFilter);
    }

    return (
      <div className="tonnage_table_container">
        <div className="sidebar" ref={sidebarRef}>
        <div className="options_container">
        <fieldset>
          <label htmlFor="tonnageInterval">Interval:&nbsp;</label>
          <select
            id="tonnageInterval"
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="WEEK">Week</option>
            <option value="MONTH">Month</option>
            <option value="SESSION">Session</option>
            <option value="CUSTOM">Custom</option>
          </select>
          {/* <button onClick={() => setShowVariationFilter(!showVariationFilter)}>
            {showVariationFilter ? "Hide Filter" : "Show Filter"}
          </button> */}
          
          
          <br/>
          {interval === "CUSTOM" && (
            <>
              <label htmlFor={`IntervalLength`}>Interval Length:&nbsp;</label>
              <input
                id={`IntervalLength`}
                placeholder={intervalLength[1] === "WEEKS" ? "1" : "7"}
                maxLength="2"
                onChange={(e) =>
                  intervalLength[1] === "WEEKS"
                    ? setIntervalLength([
                        parseInt(e.target.value) * 7,
                        intervalLength[1],
                      ])
                    : setIntervalLength([
                        parseInt(e.target.value),
                        intervalLength[1],
                      ])
                }
              />
              <br/>
              <label htmlFor={`intervalLengthIn...`}>in...&nbsp;</label>
              <select
                id={`intervalLengthIn...`}
                onChange={(e) =>
                  setIntervalLength([intervalLength[0], e.target.value])
                }
              >
                <option value="DAYS">DAYS</option>
                <option value="WEEKS">WEEKS</option>
              </select>
              <br/>
              <div>
              <label htmlFor={`BeginReferenceDate`}>
                Beginning Reference Date
              </label>
              <input
                id={`BeginReferenceDate`}
                type="date"
                onChange={(e) => setReferenceDate(e.target.value)}
              />
              </div>
            </>
          )}
          <button onClick={() => handleHideAll()}>
            {exercisesForUser.every((exercise) =>
              variationFilter[exercise].includes("HIDE")
            )
              ? "Show"
              : "Hide"}{" "}
            All Exercises
          </button>
          {/* showVariationFilter &&  */exercisesForUser.sort().map((exercise) => {
            let variationsForUser = [];
            get[exercise].forEach((sess) =>
              sess.variation_templates.forEach((template) =>
                template.forEach(
                  (variation) =>
                    !!variation &&
                    !variationsForUser.includes(variation) &&
                    variationsForUser.push(variation)
                )
              )
            );
            return (
              <div
                key={`${exercise}VariationFilter`}
                style={{ display: "block" }}
              >
                <button
                  onClick={() => {
                    if (variationFilter[exercise].includes("HIDE")) {
                      setVariationFilter({
                        ...variationFilter,
                        [exercise]: [],
                      });
                      if (variationMenus[exercise])
                        setVariationMenus({
                          ...variationMenus,
                          [exercise]: false,
                        });
                    } else {
                      setVariationFilter({
                        ...variationFilter,
                        [exercise]: ["HIDE"],
                      });
                    }
                  }}
                >
                  {variationFilter[exercise].includes("HIDE") ? "Show" : "Hide"}
                  &nbsp;
                  {exercise
                    .split("_")
                    .map((word) => word[0].toUpperCase() + word.slice(1))
                    .join(" ")}
                </button>
                {!variationFilter[exercise].includes("HIDE") && (
                  <div className="filter">
                    <button
                      onClick={() => {
                        if (!variationMenus[exercise])
                          setVariationMenus({
                            ...variationMenus,
                            [exercise]: !variationMenus[exercise],
                          });
                        else if (
                          variationMenus[exercise] &&
                          !variationFilter[exercise].length
                        )
                          setVariationMenus({
                            ...variationMenus,
                            [exercise]: !variationMenus[exercise],
                          });
                        else {
                          setVariationFilter({
                            ...variationFilter,
                            [exercise]: [],
                          });
                          Object.keys(checkRefs.current[exercise]).forEach(
                            (vari) =>
                              (checkRefs.current[exercise][
                                vari
                              ].checked = false)
                          );
                        }
                      }}
                    >
                      {variationFilter[exercise].length > 0
                        ? "Show All"
                        : variationMenus[exercise]
                        ? "Filter <"
                        : "Filter >"}
                    </button>
                    <div style={{display:"flex", flexWrap:"wrap",justifyContent:"space-around"}}>

                    {variationMenus[exercise] &&
                      /* variationObject[exercise].flat() */ variationsForUser.map(
                        (value) => {
                          return (
                            <label style={{whiteSpace:"nowrap"}} key={`${exercise}_${value}_box`}>
                              {value}
                              <input
                                ref={(el) =>
                                  (checkRefs.current = {
                                    ...checkRefs.current,
                                    [exercise]: {
                                      ...checkRefs.current[exercise],
                                      [value]: el,
                                    },
                                  })
                                }
                                type="checkbox"
                                checked={variationFilter[exercise].includes(value)}
                                onChange={(e) =>
                                  e.target.checked
                                    ? setVariationFilter({
                                        ...variationFilter,
                                        [exercise]: [
                                          ...variationFilter[exercise],
                                          value,
                                        ],
                                      })
                                    : setVariationFilter({
                                        ...variationFilter,
                                        [exercise]: variationFilter[
                                          exercise
                                        ].filter(
                                          (variation) => variation !== value
                                        ),
                                      })
                                }
                              />
                            </label>
                          );
                        }
                      )}
                      </div>
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>
        </div>
        </div>
        <div className="tableGridContainer top_line">
          <div className="inner">
          <span className="tableInterval">
            {windowInfo.screenWidth > 940 ? "Interval" 
            : "I"}
          </span>
          <span className="tableTotalReps">
            {windowInfo.screenWidth > 1100 ? "Total Reps" 
            : windowInfo.screenWidth > 940 ? "Reps" 
            : "R"}
          </span>
          <span className="tableTotalMass">
            {windowInfo.screenWidth > 1100 ? "Total Mass" 
            : windowInfo.screenWidth > 940 ? "Mass"
            : "M"}
          </span>
          <span className="tableMassPerRep">
            {windowInfo.screenWidth > 1100 ? "Mass Per Reps" 
            : windowInfo.screenWidth > 940 ? "Mass / Reps"
            : "MpR"}
          </span>
          <span className="tableMax">
            {windowInfo.screenWidth > 940 ? "Max" : "Mx"}
          </span>
          {interval === "SESSION" ? null : (
            <span className="tableAvMax">
              {windowInfo.screenWidth > 940 ? "Average Max" : "Av Mx"}
            </span>
          )}
          <span className="tableRepsPerSet">
            {windowInfo.screenWidth > 1100 ? "Reps per Set" 
            : windowInfo.screenWidth > 940 ? "Reps / Set"
            : "RpS"}
          </span>
          </div>
        </div>
        {returnTonnage(
          get,
          interval || "ALL",
          intervalLength[0] || 7,
          referenceDate,
          variationFilter
        )}
        <button className="sidebar_toggle"
          onClick={()=> sidebarRef.current.classList.toggle("active")}>
        </button>
      </div>
    );
  }

  function returnPage() {
    if (tonnagePage === "TABLE") return returnTable();
    else if (tonnagePage === "GRAPH")
      return (
        <div className="graph_page_container">
          <Graph get={get} />
        </div>
      );
  }

  return (
    <div className="tonnage_container">

      {returnPage()}
      {/* {returnPageButtons()} */}
    </div>
  );
}
