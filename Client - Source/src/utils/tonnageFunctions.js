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
  showZeroes,
  variationFilter
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
  const sidsTagged = get.date
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
    get.date.some((sess) => sess.exercises.includes(exercise))
  );

  return (
    <>
      {exerciseArray.map((exercise) => {
        return (
          <div key={`${exercise}`}>
            {" "}
            <strong>
              {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
            </strong>
            {Object.keys(sidsBinned).map((interval) => {
              const sidsByExercise = get.date
                .filter((val) => sidsBinned[interval].includes(val.sid))
                .filter((val) => val.exercises.includes(exercise));

              if (!showZeroes) {
                if (sidsByExercise.length === 0) return null;
              }

              let exerciseObjectsForSid = sidsByExercise.map((sidV) =>
                get[exercise].filter((val) => val.sid === sidV.sid)
              );

              if (variationFilter[exercise]) {
                exerciseObjectsForSid = exerciseObjectsForSid.filter((v) =>
                  v[0].variation.includes(variationFilter[exercise])
                );
              }

              const totalReps = exerciseObjectsForSid.reduce((acc, v) => {
                return acc + v[0].reps.reduce((a, val) => a + val, 0);
              }, 0);
              const totalMass = exerciseObjectsForSid.reduce((acc, v) => {
                return (
                  acc +
                  v[0].reps.reduce((a, val, ind) => a + val * v[0].mass[ind], 0)
                );
              }, 0);
              return (
                <div key={`${interval}`}>
                  <div className="tableGridContainer">
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
                        const sessionMax = v[0].mass.reduce(
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
                            const sessionMax = v[0].mass.reduce((a, val) =>
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
                          const sessionReps = v[0].reps.reduce(
                            (a, val) => a + val,
                            0
                          );
                          const sessionSets = v[0].reps.length;
                          return acc + sessionReps / sessionSets;
                        }, 0) / exerciseObjectsForSid.length
                      ).toFixed(2)}
                      {` r / s`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
