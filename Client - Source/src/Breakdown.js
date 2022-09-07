import React, { useEffect, useState } from "react";

export default function Breakdown({
  get,
  edit,
  setEdit,
  setPage,
  setGoToMonthYear,
}) {
  const session = get.sessions.find((v) => v.sid === edit);
  const [show, setShow] = useState(session.exercises);
  useEffect(() => {
    setGoToMonthYear(new Date(session.date));
  }, [session, setGoToMonthYear]);

  function sessionAggregates() {
    const {tonnage, totalReps} = show.reduce((acc, exercise) => {
      const {mass, reps} = get[exercise].find(sess => sess.sid === edit)
      acc.tonnage   += mass.reduce((a, v, i) => a + v * reps[i], 0);
      acc.totalReps += reps.reduce((a, v) => a + v);
    }, {tonnage: 0, totalReps: 0})
    return (
      <div>
        Session Tonnage:
        {tonnage}<br/>
        Session Reps:
        {totalReps}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => {
          setPage("EDIT");
        }}
      >
        Edit this Session
      </button>
      <button
        onClick={() => {
          setEdit(0);
          setPage("LOG");
        }}
      >
        Return to Log at Position
      </button>
      <button
        onClick={() => {
          setEdit(0);
          setPage("CALENDAR");
        }}
      >
        Return to Calendar at Month
      </button>
      <br />
      {new Date(session.date).toLocaleString()}
      <fieldset style={{ display: "inline-block" }}>
        {session.exercises.map((exercise) => {
          return (
            <div style={{ display: "inline-block" }} key={`${exercise}Toggle`}>
              <label htmlFor={`${exercise}Toggle`}>
                {exercise
                  .split("_")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
              </label>
              <input
                type="checkbox"
                id={`${exercise}Toggle`}
                defaultChecked
                onChange={(e) =>
                  e.target.checked
                    ? setShow([...show, exercise])
                    : setShow([...show].filter((v) => v !== exercise))
                }
              />
            </div>
          );
        })}
      </fieldset>
      {sessionAggregates()}
      {show.map((exercise) => {
        const { mass, reps, variation_templates:variation, vars } = get[exercise].find(
          (v) => v.sid === edit
        );
        // console.log(exercise, variation)
        const totalReps = reps.reduce((a, v) => a + v);
        const tonnage = mass.reduce((a, v, i) => a + v * reps[i], 0);
        return (
          <div key={`${exercise}`}>
            <strong>
              {exercise
                .split("_")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}
              {`: `}
            </strong>{" "}
            <br />
            Max: {mass.reduce((a, v) => Math.max(a, v))} kg
            {` | `}
            Total Reps: {totalReps}
            {` | `}
            {`Tonnage: `}
            {tonnage} kg <br />
            {`Average Mass: `}
            {(tonnage / totalReps).toFixed(1)} kg / r{` | `}
            {`Average Reps: `}
            {(totalReps / reps.length).toFixed(2)} r / s
            {mass.map((weight, set) => {
              return (
                <div key={`${exercise}Set${set}`}>
                  Set {set + 1}: {weight} kg |&nbsp; 
                      {reps[set]} rep{reps[set] > 1 ? `s` : null}&nbsp;
                      Template {vars[set] + 1}
                      <br />
                </div>
              );
            })}
            Template:{" "}
            {variation.map((v, i, a) => (
              <strong key={`variation${i}`}>
                {i + 1}:&nbsp;
                {v.filter(vari=>!!vari).toString().replace(/,/g, ", ")}
                {i < a.length - 1 ? ` | ` : null}
              </strong>
            ))}
            <hr />
          </div>
        );
      })}
    </div>
  );
}
