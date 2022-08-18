import React, {useState, useEffect} from "react";


const TableLogic = ({max, min, reps, step, reverse, repMax, unit}) => {
  const [initRep, setInitRep] = useState(false)
  const [initWeight, setInitWeight] = useState(false)

  useEffect(() => {
    if (reps !== null) {
      setInitRep(true)
    }
  },[reps])
  useEffect(() => {
    if (max !== null) {
      setInitWeight(true)
    }
  },[max])

  function oneRepEquiv() {
    let length = 1 + (max - min) / step;
    let weightArr = new Array(length).fill(' ')
      .map((val, i) => max - (step * i));
    if (reverse) {
      weightArr = weightArr.reverse()
    }
    if (unit === "kg") {return weightArr.map(val=>(val/2.2).toFixed(1))}
    if (unit === "lbs") {return weightArr.map(val=>(val*2.2).toFixed(1))}
    return weightArr;
  }

  function repCount(reps) {
    let repsArr = Array.from({ length: reps }).map((val, i) => i + 2)
    return repsArr;
  }

  function repEquiv(oneRepWeight) {
    let equivArr = repCount(reps).map((val, i) => (oneRepWeight * 1 / (0.95 - 0.025 * i)).toFixed(1));
    if (!repMax) { equivArr = repCount(reps).map((val, i) => (oneRepWeight * (0.95 - 0.025 * i)).toFixed(1)) };
    return equivArr
  }


  return(
    <table id="table">
        <tbody>
          <tr>
            <th>{initRep ? "1 rep" : "Set the Reps"}</th>
            {repCount(reps).map((val, i) => <th data-col={i} key={i + 1000000}>{val + " reps"}</th>)}
          </tr>
          {oneRepEquiv().map((maxWeight, ind) =>
            <tr data-weight={maxWeight} data-row={ind} key={ind}>
              <th className="weights">{initWeight ? maxWeight : "Set the Weight Parameters"}</th>
              {repEquiv(maxWeight).map((val, i) =>
                <td className={`${val}`} data-col={`${i}`} key={`v${val}i${i}`}>{val}</td>
              )}
            </tr>
          )}
        </tbody>
    </table>
)}

export default TableLogic