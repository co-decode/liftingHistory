import React, { useEffect, useState } from "react";

export default function Breakdown({
  get,
  edit,
  setEdit,
  setPage,
  setGoToMonthYear,
  windowInfo
}) {
  const session = get.sessions.find((v) => v.sid === edit);
  const sessionDate = new Date(session.date)
  const [show, setShow] = useState(session.exercises);

  useEffect(() => {
    window.scrollTo(0,0)
  },[])

  useEffect(() => {
    setGoToMonthYear(new Date(session.date));
  }, [session, setGoToMonthYear]);

  function sessionAggregates() {
    const object = show.reduce((acc, exercise, index) => {
      const {mass, reps} = get[exercise].find(sess => sess.sid === edit)
      return {tonnage:   acc.tonnage   + mass.reduce((a, v, i) => a + v * reps[i], 0),
              totalReps: acc.totalReps + reps.reduce((a, v)    => a + v)}
    }, {tonnage: 0, totalReps: 0})
    return (
      <>
      <div>
        Session Tonnage:&nbsp;
        {object.tonnage} kg
      </div>
      <div>
        Session Reps:&nbsp;
        {object.totalReps}
      </div>
      </>
    )
  }

  return (
    <div className="breakdown_container">
      <div className="button_container">
      <button
        onClick={() => {
          setEdit(0);
          setPage("LOG");
        }}
      >
        {windowInfo.screenWidth > 515 ? "Return to Log at Position" : "Log"}
      </button>
      <button
        onClick={() => {
          setEdit(0);
          setPage("CALENDAR");
        }}
      >
        {windowInfo.screenWidth > 515 ? "Return to Calendar at Month" : "Calendar"}
      </button>
      </div>
      <h1>{sessionDate.toDateString() + ", " + sessionDate.toLocaleTimeString().replace(/:00\s/, " ")}</h1>
      <div className="session_aggregates">{sessionAggregates()}</div>
      <div className="show_exercises">
        {session.exercises.map((exercise) => {
          return (
            <div key={`${exercise}Toggle`}>
              <label htmlFor={`${exercise}Toggle`}>
                {exercise
                  .split("_")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}&nbsp;
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
                </label>
            </div>
          );
        })}
      </div>
      {show.map((exercise,ind,arr) => {
        const { mass, reps, variation_templates:variation, vars } = get[exercise].find(
          (v) => v.sid === edit
        );
        const totalReps = reps.reduce((a, v) => a + v);
        const tonnage = mass.reduce((a, v, i) => a + v * reps[i], 0);
        return (
          <div key={`${exercise}`} className="exercise_container">
            <h2>
            <strong>
              {exercise
                .split("_")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}
            </strong>
            </h2>
            <div className="top_line">
              <div>
            Max:&nbsp;{mass.reduce((a, v) => Math.max(a, v))} kg
              </div>
              <div>
            Total Reps:&nbsp;{totalReps}
              </div>
              <div>
            Tonnage:&nbsp;{tonnage} kg 
              </div>
            </div>
            <div className="second_line">
              <div>
            Average Mass:&nbsp;
            {(tonnage / totalReps).toFixed(1)} kg / r
              </div>
              <div>
            Average Reps:&nbsp;
            {(totalReps / reps.length).toFixed(2)} r / s
              </div>
            </div>
            {mass.map((weight, set) => {
              return (
                <div key={`${exercise}Set${set}`} className="set_lines">
                  <div>
                    <strong>
                    {windowInfo.screenWidth > 500 && "Set"}
                  &nbsp;{set + 1}: 
                    </strong>
                  </div>
                  <div>
                  {weight}&nbsp;kg
                  </div>
                  <div>
                      {reps[set]}&nbsp;rep{reps[set] > 1 ? `s` : null}
                  </div>
                  <div>
                    {windowInfo.screenWidth > 500 ? "Template" : "T:"}
                      &nbsp;{vars[set] + 1}
                  </div>
                </div>
              );
            })}
            Templates:&nbsp;
            {variation.map((v, i, a) => (
              <div key={`${exercise}variation${i}`}>
              <strong key={`variation${i}`}>
                {i + 1}&nbsp;
                {v.filter(vari=>!!vari).toString().replace(/,/g, ", ")}
              </strong>
              </div>
            ))}
            {ind < arr.length - 1 && <hr/>}
          </div>
        );
      })}
      {windowInfo.scrollPosition > 50 &&
            <div className="return_to_top" onClick={() =>window.scrollTo({top:0, behavior:"smooth"})}><span>{'\u2191'}</span></div>
            }
    </div>
  );
}
