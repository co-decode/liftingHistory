import { exerciseArray } from "./variables";
const reps = "REPS";
const mass = "MASS";
const session = "SESSION";
const week = "WEEK";
const month = "MONTH";
const all = "ALL";

export default function returnTonnage(get, tonFormat, interval) {
  // if (tonFormat === reps) {
    if (![reps, mass].includes(tonFormat)) {
      return null
    }
    else if (interval === session) {
      // return repsPerSession(get);
      return sessionTon(get, tonFormat)
    }
    else if (interval === week) {
      return weekTon(get, tonFormat);
    }
    else if (interval === month) {
      // return repsPerMonth(get);
      return monthTon(get, tonFormat)

    }
    else if (interval === all) {
      return totalTon(get, tonFormat)
      // return totalReps(get);
    }
  // } else if (tonFormat === mass) {
  //   if (interval === session) {
  //     return massPerSession(get);
  //   } else if (interval === week) {
  //     return massPerWeek(get);
  //   } else if (interval === month) {
  //     return massPerMonth(get);
  //   } else if (interval === all) {
  //     return totalMass(get);
  //   }
  // }
}

// function repsPerSession(get) {
//   return (
//     <>
//       <div>
//         - Total Reps -{" "}
//         {exerciseArray.map((exercise) => {
//           const sidList = get.date.filter((val) =>
//             val.exercises.includes(exercise)
//           );
//           return (
//             <div key={`${exercise}TotalReps`}>
//               {" "}
//               {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//               {sidList
//                 .map((sidV) => [
//                   get[exercise].filter((val) => val.sid === sidV.sid),
//                   sidV.date,
//                 ])
//                 .map((v) => {
//                   let addition;
//                   // console.log(JSON.stringify(v))
//                   if (v[0][0].scheme === "Linear") {
//                     addition = v[0][0].reps * v[0][0].sets;
//                   } else if (v[0][0].scheme === "Pyramid") {
//                     addition = v[0][0].reps;
//                   }
//                   return (
//                     <div key={`${v[1]}_${addition}`}>
//                       Session Date: {new Date(v[1]).toDateString()} Reps:{" "}
//                       {addition}
//                     </div>
//                   );
//                 })}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }
// function repsPerWeek(get) {
//   function getWeek(date) {
//     const time = new Date(date);
//     const onejan = new Date(time.getFullYear(), 0, 1);
//     const week = Math.ceil(
//       ((time.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
//     );
//     return week;
//   }
//   const sidsBundled = get.date.map((v) => {
//     return {
//       sid: v.sid,
//       week: `${getWeek(v.date)}-${new Date(v.date).getFullYear()}`,
//     };
//   });
//   const sidsBinned = sidsBundled.reduce((acc, v) => {
//     return Object.keys(acc).includes(v.week)
//       ? { ...acc, [v.week]: [...acc[v.week], v.sid] }
//       : { ...acc, [v.week]: [v.sid] };
//   }, {});
//   return (
//     <>
//       {Object.keys(sidsBinned).map((week) => {
//         return (
//           <div key={`${week}`}>
//             <div>{week}</div>
//             <div>
//               {exerciseArray.map((exercise) => {
//                 const sidsByExercise = get.date
//                   .filter((val) => sidsBinned[week].includes(val.sid))
//                   .filter((val) => val.exercises.includes(exercise));
//                 return (
//                   <div key={`${exercise}TotalReps`}>
//                     {" "}
//                     {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//                     {sidsByExercise
//                       .map((sidV) =>
//                         get[exercise].filter((val) => val.sid === sidV.sid)
//                       )
//                       .reduce((acc, v) => {
//                         let addition;
//                         // console.log(JSON.stringify(v))
//                         if (v[0].scheme === "Linear") {
//                           addition = v[0].reps * v[0].sets;
//                         } else if (v[0].scheme === "Pyramid") {
//                           addition = v[0].reps;
//                         }
//                         return acc + addition;
//                       }, 0)}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }
// function repsPerMonth(get) {
//   const sidsBundled = get.date.map((v) => {
//     return {
//       sid: v.sid,
//       month: `${new Date(v.date).getMonth() + 1}-${new Date(
//         v.date
//       ).getFullYear()}`,
//     };
//   });
//   const sidsBinned = sidsBundled.reduce((acc, v) => {
//     return Object.keys(acc).includes(v.month)
//       ? { ...acc, [v.month]: [...acc[v.month], v.sid] }
//       : { ...acc, [v.month]: [v.sid] };
//   }, {});
//   return (
//     <>
//       {Object.keys(sidsBinned).map((month) => {
//         return (
//           <div key={`${month}`}>
//             <div>{month}</div>
//             <div>
//               {exerciseArray.map((exercise) => {
//                 const sidsByExercise = get.date
//                   .filter((val) => sidsBinned[month].includes(val.sid))
//                   .filter((val) => val.exercises.includes(exercise));
//                 return (
//                   <div key={`${exercise}TotalReps`}>
//                     {" "}
//                     {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//                     {sidsByExercise
//                       .map((sidV) =>
//                         get[exercise].filter((val) => val.sid === sidV.sid)
//                       )
//                       .reduce((acc, v) => {
//                         let addition;
//                         // console.log(JSON.stringify(v))
//                         if (v[0].scheme === "Linear") {
//                           addition = v[0].reps * v[0].sets;
//                         } else if (v[0].scheme === "Pyramid") {
//                           addition = v[0].reps;
//                         }
//                         return acc + addition;
//                       }, 0)}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }
// function totalReps(get) {
//   return (
//     <>
//       <div>
//         - Total Reps -{" "}
//         {exerciseArray.map((exercise) => {
//           const sidList = get.date.filter((val) =>
//             val.exercises.includes(exercise)
//           );
//           return (
//             <div key={`${exercise}TotalReps`}>
//               {" "}
//               {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//               {sidList
//                 .map((sidV) =>
//                   get[exercise].filter((val) => val.sid === sidV.sid)
//                 )
//                 .reduce((acc, v) => {
//                   let addition;
//                   // console.log(JSON.stringify(v))
//                   if (v[0].scheme === "Linear") {
//                     addition = v[0].reps * v[0].sets;
//                   } else if (v[0].scheme === "Pyramid") {
//                     addition = v[0].reps;
//                   }
//                   return acc + addition;
//                 }, 0)}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }
// function massPerSession(get) {
//   return (
//     <>
//       <div>
//         - Mass Tonnage -{" "}
//         {exerciseArray.map((exercise) => {
//           const sidList = get.date.filter((val) =>
//             val.exercises.includes(exercise)
//           );
//           return (
//             <div key={`${exercise}MassTonnage`}>
//               {" "}
//               {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//               {sidList
//                 .map((sidV) => [
//                   get[exercise].filter((val) => val.sid === sidV.sid),
//                   sidV.date,
//                 ])
//                 .map((v) => {
//                   let addition = massFormula(v[0][0].scheme, v[0][0].mass, v[0][0].reps, v[0][0].sets)
//                   return (
//                     <div key={`${v[1]}_${addition}`}>
//                       Session Date: {new Date(v[1]).toDateString()}{" "}
//                       {parseInt(addition)} kg
//                     </div>
//                   );
//                 })}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }
// function massPerWeek(get) {
//   function getWeek(date) {
//     const time = new Date(date);
//     const onejan = new Date(time.getFullYear(), 0, 1);
//     const week = Math.ceil(
//       ((time.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
//     );
//     return week;
//   }
//   const sidsBundled = get.date.map((v) => {
//     return {
//       sid: v.sid,
//       week: `${getWeek(v.date)}-${new Date(v.date).getFullYear()}`,
//     };
//   });
//   const sidsBinned = sidsBundled.reduce((acc, v) => {
//     return Object.keys(acc).includes(v.week)
//       ? { ...acc, [v.week]: [...acc[v.week], v.sid] }
//       : { ...acc, [v.week]: [v.sid] };
//   }, {});
//   return (
//     <>
//       {Object.keys(sidsBinned).map((week) => {
//         return (
//           <div key={`${week}`}>
//             <div>{week}</div>
//             <div>
//               {exerciseArray.map((exercise) => {
//                 const sidsByExercise = get.date
//                   .filter((val) => sidsBinned[week].includes(val.sid))
//                   .filter((val) => val.exercises.includes(exercise));
//                 return (
//                   <div key={`${exercise}TotalReps`}>
//                     {" "}
//                     {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//                     {sidsByExercise
//                       .map((sidV) =>
//                         get[exercise].filter((val) => val.sid === sidV.sid)
//                       )
//                       .reduce((acc, v) => {
//                         return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets));
//                       }, 0)}{" "}
//                     kg
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }
// function massPerMonth(get) {
//   const sidsBundled = get.date.map((v) => {
//     return {
//       sid: v.sid,
//       month: `${new Date(v.date).getMonth() + 1}-${new Date(
//         v.date
//       ).getFullYear()}`,
//     };
//   });
//   const sidsBinned = sidsBundled.reduce((acc, v) => {
//     return Object.keys(acc).includes(v.month)
//       ? { ...acc, [v.month]: [...acc[v.month], v.sid] }
//       : { ...acc, [v.month]: [v.sid] };
//   }, {});
//   return (
//     <>
//       {Object.keys(sidsBinned).map((month) => {
//         return (
//           <div key={`${month}`}>
//             <div>{month}</div>
//             <div>
//               {exerciseArray.map((exercise) => {
//                 const sidsByExercise = get.date
//                   .filter((val) => sidsBinned[month].includes(val.sid))
//                   .filter((val) => val.exercises.includes(exercise));
//                 return (
//                   <div key={`${exercise}TotalReps`}>
//                     {" "}
//                     {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//                     {sidsByExercise
//                       .map((sidV) =>
//                         get[exercise].filter((val) => val.sid === sidV.sid)
//                       )
//                       .reduce((acc, v) => {
//                         return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets));
//                       }, 0)}{" "}
//                     kg
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }
// function totalMass(get) {
//   return (
//     <>
//       <div>
//         - Mass Tonnage -{" "}
//         {exerciseArray.map((exercise) => {
//           const sidList = get.date.filter((val) =>
//             val.exercises.includes(exercise)
//           );
//           return (
//             <div key={`${exercise}MassTonnage`}>
//               {" "}
//               {exercise[0].toUpperCase() + exercise.slice(1) + ": "}
//               {sidList
//                 .map((sidV) =>
//                   get[exercise].filter((val) => val.sid === sidV.sid)
//                 )
//                 .reduce((acc, v) => {
//                   return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets));
//                 }, 0)}{" "}
//               kg
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }

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
                  if (tonFormat === reps){
                    addition = repsFormula(v[0][0].scheme, v[0][0].reps, v[0][0].sets)
                  }
                  else if (tonFormat === mass) {
                    addition = parseInt(massFormula(v[0][0].scheme, v[0][0].mass, v[0][0].reps, v[0][0].sets))
                  }
                  return (
                    <div key={`${v[1]}_${addition}`}>
                      Session Date: {new Date(v[1]).toDateString()} {tonFormat[0] + tonFormat.slice(1).toLowerCase()}:{" "}
                      {addition} {tonFormat === mass ? " kg" : null}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </>
  )
}
function weekTon(get, tonFormat) {
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
                        if (tonFormat === reps) {
                          return acc + repsFormula(v[0].scheme, v[0].reps, v[0].sets)
                        } 
                        else if (tonFormat === mass) {
                          return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets))
                        }
                      }, 0)}
                      {tonFormat === reps ? null : ` kg`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  )
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
                        if (tonFormat === reps) {
                          return acc + repsFormula(v[0].scheme, v[0].reps, v[0].sets)
                        } 
                        else if (tonFormat === mass) {
                          return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets))
                        }
                      }, 0)}{" "}
                    {tonFormat === reps ? null : ` kg`}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  )
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
                  if (tonFormat === reps) {
                    return acc + repsFormula(v[0].scheme, v[0].reps, v[0].sets)
                  } 
                  else if (tonFormat === mass) {
                    return acc + parseInt(massFormula(v[0].scheme, v[0].mass, v[0].reps, v[0].sets))
                  }
                }, 0)}
                {tonFormat === reps ? null : ` kg`}
            </div>
          );
        })}
      </div>
    </>
  );
}

function massPyramidFormula(mass, reps, sets) {
  return (mass * 0.8 * 10 +
    mass * 0.85 * 6 +
    mass * 0.9 * 3 +
    mass * 0.95 * 1 * (reps / 20) * ((2.5 * sets) / reps));
}

function massFormula(scheme, mass, reps, sets) {
  if (scheme === "Linear") {
    return mass * reps * sets;
  } else if (scheme === "Pyramid") {
    return massPyramidFormula(mass, reps, sets);
  }
}

function repsFormula(scheme, reps, sets) {
  if (scheme === "Linear") {
    return reps * sets;
  } else if (scheme === "Pyramid") {
    return reps;
  }
}