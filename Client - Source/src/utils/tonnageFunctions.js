import { exerciseArray } from "./variables";

const [reps, mass, session, custom, month, all, week] = [
  "REPS",
  "MASS",
  "SESSION",
  "CUSTOM",
  "MONTH",
  "ALL",
  "WEEK"
];

export default function returnTonnage(get, tonFormat, interval, intervalLengthInDays, beginning) {
  if (![reps, mass].includes(tonFormat)) return null;
  else if (interval === session) 
    return sessionTon(get, tonFormat);
  else if ([custom, month, all, week].includes(interval)) 
    return intervalTon(get, tonFormat, interval, intervalLengthInDays = 7, beginning);
  /* else if (interval === week) return weekTon(get, tonFormat);
  else if (interval === month) return monthTon(get, tonFormat);
  else if (interval === all) return totalTon(get, tonFormat); */
}

function sessionTon(get, tonFormat) {
  return (
    <>
      <div>
        - Total Reps -{" "}
        {exerciseArray.map((exercise) => {
          const sidList = get.date.filter((val) =>
            val.exercises.includes(exercise)
          );
          return (
            <div key={`${exercise}${tonFormat}`}>
              {" "}
              {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
              {sidList
                .map((sidV) => [
                  get[exercise].filter((val) => val.sid === sidV.sid),
                  sidV.date,
                ])
                .map((v) => {
                  let addition;
                  let session = v[0][0];
                  if (tonFormat === reps) {
                    addition = session.reps.reduce(
                      (acc, val) => (acc += val),
                      0
                    );
                  } else if (tonFormat === mass) {
                    addition = session.reps.reduce(
                      (acc, val, ind) => (acc += val * session.mass[ind]),
                      0
                    );
                  }
                  return (
                    <div key={`${v[1]}_${addition}`}>
                      {tonFormat[0] + tonFormat.slice(1).toLowerCase()}:{" "}
                      {addition} {tonFormat === mass && " kg"}
                      {" - "}
                      {new Date(v[1]).toDateString()}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* function weekTon(get, tonFormat) {
  function getWeek(date) {
    const time = new Date(date);
    const onejan = new Date(time.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((time.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
    return week;
  }
  const sidsBundled = get.date.map((v) => {
    return {
      sid: v.sid,
      week: `${getWeek(v.date)}-${new Date(v.date).getFullYear()}`,
    };
  });
  const sidsBinned = sidsBundled.reduce((acc, v) => {
    return Object.keys(acc).includes(v.week)
      ? { ...acc, [v.week]: [...acc[v.week], v.sid] }
      : { ...acc, [v.week]: [v.sid] };
  }, {});
  return (
    <>
      {Object.keys(sidsBinned).map((week) => {
        return (
          <div key={`${week}`}>
            <div>{week}</div>
            <div>
              {exerciseArray.map((exercise) => {
                const sidsByExercise = get.date
                  .filter((val) => sidsBinned[week].includes(val.sid))
                  .filter((val) => val.exercises.includes(exercise));
                return (
                  <div key={`${exercise}${tonFormat}`}>
                    {" "}
                    {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
                    {sidsByExercise
                      .map((sidV) =>
                        get[exercise].filter((val) => val.sid === sidV.sid)
                      )
                      .reduce((acc, v) => {
                        const session = v[0];
                        if (tonFormat === reps) {
                          return (
                            acc + session.reps.reduce((a, val) => a + val, 0)
                          );
                        } else if (tonFormat === mass) {
                          return (
                            acc +
                            session.reps.reduce(
                              (a, val, ind) => a + val * session.mass[ind],
                              0
                            )
                          );
                        } else return acc;
                      }, 0)}
                    {tonFormat === mass && ` kg`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function monthTon(get, tonFormat) {
  const sidsBundled = get.date.map((v) => {
    return {
      sid: v.sid,
      month: `${new Date(v.date).getMonth() + 1}-${new Date(
        v.date
      ).getFullYear()}`,
    };
  });
  const sidsBinned = sidsBundled.reduce((acc, v) => {
    return Object.keys(acc).includes(v.month)
      ? { ...acc, [v.month]: [...acc[v.month], v.sid] }
      : { ...acc, [v.month]: [v.sid] };
  }, {});
  return (
    <>
      {Object.keys(sidsBinned).map((month) => {
        return (
          <div key={`${month}`}>
            <div>{month}</div>
            <div>
              {exerciseArray.map((exercise) => {
                const sidsByExercise = get.date
                  .filter((val) => sidsBinned[month].includes(val.sid))
                  .filter((val) => val.exercises.includes(exercise));
                return (
                  <div key={`${exercise}${tonFormat}`}>
                    {" "}
                    {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
                    {sidsByExercise
                      .map((sidV) =>
                        get[exercise].filter((val) => val.sid === sidV.sid)
                      )
                      .reduce((acc, v) => {
                        const session = v[0];
                        if (tonFormat === reps) {
                          return (
                            acc + session.reps.reduce((a, val) => a + val, 0)
                          );
                        } else if (tonFormat === mass) {
                          return (
                            acc +
                            session.reps.reduce(
                              (a, val, ind) => a + val * session.mass[ind],
                              0
                            )
                          );
                        } else return null;
                      }, 0)}{" "}
                    {tonFormat === mass && ` kg`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
} */

function intervalTon(get, tonFormat, intervalFormat, intervalLengthInDays, begin) {
  function getCustomInterval(date) {
    const time = new Date(date);
    const onejan = new Date(time.getFullYear(), 0, 1);
    const referenceDate = begin || onejan
    const interval = Math.ceil(
      (time.getTime() - referenceDate.getTime()) / 86400000 / intervalLengthInDays
    );
    return interval;
  }
  function returnInterval(date) {
    if (intervalFormat === "CUSTOM") {
      return begin ? `${getCustomInterval(date)}` : `${getCustomInterval(date)}-${new Date(date).getFullYear()}`;
    }
    else if (intervalFormat === week) return `${getCustomInterval(date)}-${new Date(date).getFullYear()}`;
    else if (intervalFormat === month) return `${new Date(date).getMonth() + 1}-${new Date(date).getFullYear()}`;
    else if (intervalFormat === all) return `ALL` ;
  }
  const sidsTagged = get.date.map((v) => {
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
  return (
    <>
      {Object.keys(sidsBinned).map((interval) => {
        return (
          <div key={`${interval}`}>
            <div>{interval}</div>
            <div>
              {exerciseArray.map((exercise) => {
                const sidsByExercise = get.date
                  .filter((val) => sidsBinned[interval].includes(val.sid))
                  .filter((val) => val.exercises.includes(exercise));
                if (sidsByExercise.length === 0) return null;
                return (
                  <div key={`${exercise}${tonFormat}`}>
                    {" "}
                    {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
                    {sidsByExercise
                      .map((sidV) =>
                        get[exercise].filter((val) => val.sid === sidV.sid)
                      )
                      .reduce((acc, v) => {
                        const session = v[0];
                        if (tonFormat === reps) {
                          return (
                            acc + session.reps.reduce((a, val) => a + val, 0)
                          );
                        } else if (tonFormat === mass) {
                          return (
                            acc +
                            session.reps.reduce(
                              (a, val, ind) => a + val * session.mass[ind],
                              0
                            )
                          );
                        } else return acc;
                      }, 0)}
                    {tonFormat === mass && ` kg`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function totalTon(get, tonFormat) {
  return (
    <>
      <div>
        - {`${tonFormat}`} -{" "}
        {exerciseArray.map((exercise) => {
          const sidList = get.date.filter((val) =>
            val.exercises.includes(exercise)
          );
          return (
            <div key={`${exercise}${tonFormat}`}>
              {" "}
              {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
              {sidList
                .map((sidV) =>
                  get[exercise].filter((val) => val.sid === sidV.sid)
                )
                .reduce((acc, v) => {
                  const session = v[0];
                  if (tonFormat === reps) {
                    return acc + session.reps.reduce((a, val) => a + val, 0);
                  } else if (tonFormat === mass) {
                    return (
                      acc +
                      session.reps.reduce(
                        (a, val, ind) => a + val * session.mass[ind],
                        0
                      )
                    );
                  } else return null;
                }, 0)}
              {tonFormat === mass && ` kg`}
            </div>
          );
        })}
      </div>
    </>
  );
}
