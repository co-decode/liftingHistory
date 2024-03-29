import { exerciseArray as exerciseList } from "./variables";

const [session, custom, month, all, week] = [
  "SESSION",
  "CUSTOM",
  "MONTH",
  "ALL",
  "WEEK",
];

export default function intervalTon(
  get,
  intervalFormat,
  intervalLengthInDays,
  begin,
  variationFilter,
  sort
) {
  function getCustomInterval(date) {
    const time = new Date(date);
    const onejan = new Date(time.getFullYear(), 0, 1);
    const referenceDate = begin ? new Date(begin) : onejan;
    const interval = Math.ceil(
      (time.getTime() - referenceDate.getTime()) /
        86400000 /
        intervalLengthInDays
    );
    return interval;
  }
  function returnInterval(date) {
    if (intervalFormat === custom) {
      return begin
        ? `${getCustomInterval(date)}`
        : `${getCustomInterval(date)}-${new Date(date).getFullYear()}`;
    } else if (intervalFormat === week)
      return `${getCustomInterval(date)}-${new Date(date).getFullYear()}`;
    else if (intervalFormat === month)
      return `${new Date(date).getMonth() + 1}-${new Date(date).getFullYear()}`;
    else if (intervalFormat === all) return all;
    else if (intervalFormat === session)
      return `${new Date(date).toDateString()}`;
  }
  const sidsTagged = get.sessions
    .sort((a, b) => {
      return sort === "Oldest" 
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .map((v) => {
      return {
        sid: v.sid,
        interval: returnInterval(v.date),
      };
    });

  const sidsBinned = sidsTagged.reduce((acc, v) => {
    return Object.keys(acc).includes(v.interval)
      ? { ...acc, [v.interval]: [...acc[v.interval], v.sid] }
      : { ...acc, [v.interval]: [v.sid] };
  }, {});
  
  const exerciseArray = exerciseList.filter((exercise) =>
  get.sessions.some((sess) => sess.exercises.includes(exercise))
  );
  
  return (
    <>
      {exerciseArray.sort().map((exercise) => {
          // vv A session exists with the variation selected
        if (variationFilter[exercise].length){ 
        const sidsByExerciseByVariation = get[exercise]
          .some(session => variationFilter[exercise]
            .some(variation => session.variation_templates.flat().includes(variation)) )
        if (!sidsByExerciseByVariation) return null
      }
        return (
          <div key={`${exercise}`}>
            {Object.keys(sidsBinned).map((interval, index) => {

              const sidsByExercise = get.sessions
                .filter((val) => sidsBinned[interval].includes(val.sid))
                .filter((val) => val.exercises.includes(exercise));

              let exerciseObjectsForSid = sidsByExercise.map((sidV) =>
              get[exercise].find((val) => val.sid === sidV.sid)
              );
              
              if (variationFilter[exercise].length) {
                const sessionsWithVariation = exerciseObjectsForSid.filter((session) =>
                variationFilter[exercise].some((variation)=>
                  session.variation_templates.flat().includes(variation)))
                
                const sessionsGutted = sessionsWithVariation.map(sess => { 
                  const templatesWithVariation = sess.variation_templates
                    .reduce((acc, template, tempNo) => 
                      variationFilter[exercise].some(variation => 
                        template.includes(variation)) 
                        ? [...acc, tempNo] 
                        : acc, 
                      [])
                  const indicesOfInterest = sess.vars.reduce((acc, tag, setNo) => 
                    templatesWithVariation.includes(tag) 
                    ? [...acc, setNo] 
                    : acc,
                    [])
                  const guttedSession = {
                    mass: sess.mass.filter((massVal, setNumber)=>indicesOfInterest.includes(setNumber)),
                    reps: sess.reps.filter((repsVal, setNumber)=>indicesOfInterest.includes(setNumber)),
                    vars: sess.vars.filter((varsVal, setNumber)=>indicesOfInterest.includes(setNumber)),
                    variation_templates: sess.variation_templates.filter((temp, tempNo) => templatesWithVariation.includes(tempNo))
                  }
                  return guttedSession
                })
                exerciseObjectsForSid = sessionsGutted
                }

              const filterZeroes = () => {
                if (exerciseObjectsForSid.length === 0) return null;
                return (
                  <div key={`${interval}`}>
                  <div className="tableGridContainer">
                    <div className="inner">
                    <span className="tableInterval">{interval}</span>
                    <span className="tableTotalReps">{totalReps}</span>
                    <span className="tableTotalMass">
                      {totalMass}
                      {` kg`}
                    </span>
                    <span className={`tableMassPerRep`}>
                      {(totalMass / totalReps).toFixed(2)}
                      {` kg / r`}
                    </span>
                    <span className={`tableMax`}>
                      {exerciseObjectsForSid.reduce((intervalMax, v) => {
                        const sessionMax = v.mass.reduce(
                          (a, val) => (val > a ? val : a),
                          0
                        );
                        return sessionMax > intervalMax
                          ? sessionMax
                          : intervalMax;
                      }, 0)}
                      {` kg`}
                    </span>
                    {intervalFormat !== session ? (
                      <span className={`tableAvMax`}>
                        {`${(
                          exerciseObjectsForSid.reduce((sessionMaxes, v) => {
                            const sessionMax = v.mass.reduce((a, val) =>
                              Math.max(a, val)
                            );
                            return sessionMaxes + sessionMax;
                          }, 0) / exerciseObjectsForSid.length
                        ).toFixed(2)} kg`}
                      </span>
                    ) : null}
                    <span className={`tableRepsPerSet`}>
                      {(
                        exerciseObjectsForSid.reduce((acc, v) => {
                          const sessionReps = v.reps.reduce(
                            (a, val) => a + val,
                            0
                          );
                          const sessionSets = v.reps.length;
                          return acc + sessionReps / sessionSets;
                        }, 0) / exerciseObjectsForSid.length
                        ).toFixed(2)}
                      {` r / s`}
                    </span>
                    </div>
                  </div>
                  </div>
                )
              }

              
              const totalReps = exerciseObjectsForSid.reduce((acc, v) => {
                return acc + v.reps.reduce((a, val) => a + val, 0);
              }, 0);
              const totalMass = exerciseObjectsForSid.reduce((acc, v) => {
                return (
                  acc + v.reps.reduce((a, val, ind) => a + val * v.mass[ind], 0)
                  );
                }, 0);
              return (
                <div key={`${exercise}${interval}`}>
                  { !index &&
                  <strong>
                    {exercise
                      .split("_")
                      .map((word) => word[0].toUpperCase() + word.slice(1))
                      .join(" ") + ": "}
                  </strong>}
                  {filterZeroes()}
                </div>
              );
            })}
            </div>
        );
      })}
    </>
  );
}
