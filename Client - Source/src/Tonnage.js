import React, { useState } from "react";
import Graph from "./Graph";
import returnTonnage from "./utils/tonnageFunctions";

export default function Tonnage({ get }) {
  const [interval, setInterval] = useState(null);
  const [intervalLength, setIntervalLength] = useState([null, null]);
  const [referenceDate, setReferenceDate] = useState(null);
  const [showZeroes, setShowZeroes] = useState(false);
  const [variationFilter, setVariationFilter] = useState({});
  // const customInput = useRef()


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

  return (
    <>
      <fieldset>
        <label htmlFor="tonnageInterval">Interval</label>
        <select
          id="tonnageInterval"
          onChange={(e) => setInterval(e.target.value)}
        >
          {/* <option value="">___</option> */}
          <option value="ALL">All Time</option>
          <option value="WEEK">Week</option>
          <option value="MONTH">Month</option>
          <option value="SESSION">Session</option>
          <option value="CUSTOM">Custom</option>
        </select>
        {interval === "CUSTOM" && (
          <>
            <label htmlFor={`IntervalLength`}>Interval Length</label>
            <input
              id={`IntervalLength`}
              placeholder={intervalLength[1] === "WEEKS" ? "1" : "7"}
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
            <label htmlFor={`intervalLengthIn...`}>in...</label>
            <select
              id={`intervalLengthIn...`}
              onChange={(e) =>
                setIntervalLength([intervalLength[0], e.target.value])
              }
            >
              <option value="DAYS">DAYS</option>
              <option value="WEEKS">WEEKS</option>
            </select>
            <label htmlFor={`BeginReferenceDate`}>
              Beginning Reference Date
            </label>
            <input
              id={`BeginReferenceDate`}
              type="date"
              onChange={(e) => setReferenceDate(e.target.value)}
            />
          </>
        )}{ interval !== "SESSION" &&
        <>
        <label htmlFor="showZeroes">Show Zeroes</label>
        <input
          type="checkbox"
          id="showZeroes"
          onChange={(e) => setShowZeroes(e.target.checked)}
        />
        </>}
        {["deadlift", "squat", "bench"].map((exercise) => {
          return (
            <div key={`${exercise}VariationFilter`} style={{display: "inline-block"}}>
              <label htmlFor={`${exercise}VariationFilter`}>
                {exercise.replace(/^\w/, exercise[0].toUpperCase())}:
              </label>
              <select
                id={`${exercise}VariationFilter`}
                onChange={(e) =>
                  setVariationFilter({
                    ...variationFilter,
                    [exercise]: e.target.value,
                  })
                }
              >
                <option value=""> Use All </option>
                {variationObject[exercise].flat().map((value) => {
                  return <option key={`${value}`}>{value}</option>;
                })}
              </select>
            </div>
          );
        })}
      </fieldset>
      {returnTonnage(
        get,
        interval || "ALL",
        intervalLength[0] || 7,
        referenceDate,
        showZeroes,
        variationFilter
      )}
      <Graph get={get}/>
    </>
  );
}
