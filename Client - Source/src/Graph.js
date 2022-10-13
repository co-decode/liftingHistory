import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Graph({ get }) {
  const [input, setInput] = useState({ interval: "SESSION", exercise: "ALL" });
  const [intervalLength, setIntervalLength] = useState([null, null]);
  const [referenceDate, setReferenceDate] = useState(null);
  const [varFilter, setVarFilter] = useState([])
  const [dataRange, setDataRange] = useState({
    earliest: dateInitialiser("EARLIEST"),
    latest: dateInitialiser("LATEST"),
    apply: false,
  });

  useEffect(() => {
    setVarFilter( [] )
  }, [input.exercise])

  function dateInitialiser(date) {
    const stringsToDates = get.sessions.map((v) => new Date(v.date));

    function isoSlicer(dateObject) {
      return dateObject.toISOString().slice(0, 10);
    }

    if (date === "EARLIEST") {
      return isoSlicer(stringsToDates.reduce((a, v) => (a <= v ? a : v)));
    } else if (date === "LATEST") {
      const latest = stringsToDates.reduce((a, v) => (a >= v ? a : v));
      return isoSlicer(
        new Date(
          latest.setTime(
            latest.getTime() +
              (24 - latest.getTimezoneOffset() / 60) * 60 * 60 * 1000
          )
        )
      );
    }
  }

  function optionsInitialiser(interval) {
    let x;
    if (interval === "SESSION")
      x = {
        type: "time",
        time: {
          unit: "day",
        },
        grid: {
          drawOnChartArea: false,
        },
      };
    else if (interval !== "SESSION")
      x = {
        type: "category",
        grid: {
          drawOnChartArea: false,
        },
      };
    return {
      responsive: true,
      maintainAspectRatio:false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: false,
          text: "Lifting Analysis",
        },
      },
      scales: {
        x,
        y1: {
          min: 0,
          type: "linear",
          display: "auto",
          position: "left",
          grid: {
            drawOnChartArea: true,
          },
          ticks: {
            precision: 0,
          },
          grace: "5%",
        },
        y: {
          min: 0,
          type: "linear",
          display: "auto",
          position: "left",
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: function (value, index, ticks) {
              return value + ` kg`;
            },
            precision: 0
          },
        },
      },
    };
  }

  const dataInitialiser = useMemo(() => {
    function getCustomInterval(date) {
      const time = new Date(date);
      const referenceDatum =
        referenceDate && input.interval === "CUSTOM"
          ? new Date(referenceDate)
          : new Date(time.getFullYear(), 0, 1);
      const intervalLengthInDays = intervalLength[0] || 7;
      const interval = Math.ceil(
        (time.getTime() - referenceDatum.getTime()) /
          86400000 /
          intervalLengthInDays
      );
      return interval;
    }

    function getDifference(first, last) {
      const firstDate = new Date(first);
      const lastDate = new Date(last);
      if (input.interval === "MONTH") {
        const yearDifference = lastDate.getFullYear() - firstDate.getFullYear();
        const monthsBetween =
          lastDate.getMonth() - firstDate.getMonth() + yearDifference * 12;
        return monthsBetween;
      } else if (["WEEK", "CUSTOM"].includes(input.interval)) {
        const yearDifference = lastDate.getFullYear() - firstDate.getFullYear();
        const intervalDifference =
          getCustomInterval(last) - getCustomInterval(first);
        const intervalsPerYear = 365.25 / (intervalLength[0] || 7);

        return intervalDifference + parseInt(yearDifference * intervalsPerYear);
      }
    }

    const sessionList = dataRange.apply
      ? get.sessions.filter(
          (sess) =>
            new Date(sess.date) >= new Date(dataRange.earliest) &&
            new Date(sess.date) <= new Date(dataRange.latest)
        )
      : get.sessions;

    function filterSessions() {
      if (input.exercise === "ALL") return sessionList
      else {
        if (varFilter.length) {
          return sessionList.filter((sess) => sess.exercises.includes(input.exercise))
          .filter(sess=> get[input.exercise]
            .find(exerciseSession=>exerciseSession.sid === sess.sid).variation_templates
            .flat().filter(vari=> vari)
            .some(variation => varFilter.includes(variation) ) )
        }
        return sessionList.filter((sess) => sess.exercises.includes(input.exercise))
      } 
    }
    const sessionListFiltered = filterSessions()

    const getDataset = (/* what, */ input) => {
      function returnExerciseObject(getWhat, sid) {
        const sess =  get[getWhat].find((entry) => entry.sid === sid)
        // const sidsWithExercise = sessionList.filter((sess) => sess.exercises.includes(input.exercise)).map(sess => sess.sid)
          // const exercisesObjectsWithSid = get[input.exercise].filter(sess=> sidsWithExercise.includes(sess.sid) )
          // const sessionsWithVariation = exercisesObjectsWithSid.filter((session) =>
          //     varFilter.some((variation)=>
          //       session.variation_templates.flat().includes(variation)))
              
          // const sessionsGutted = sessionsWithVariation.map(sess => { 
        if (varFilter.length){
          const templatesWithVariation = sess.variation_templates
            .reduce((acc, template, tempNo) => 
              varFilter.some(variation => 
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
        }
          // })
          // return sessionsGutted

        return sess;
      }
      function totalMassRepsSets(exerciseObject) {
        let output = {mass: [], reps: [], sets: []}
        // if (what === "mass") {
          //return 
          output.mass = exerciseObject.reps.reduce(
            (a, v, i) => a + v * exerciseObject.mass[i],
            0
          );
        // } else if (what === "reps")
          // return 
          output.reps = exerciseObject.reps.reduce((a, v) => {
            return a + v;
          }, 0);
        // else if (what === "sets") /* return */ 
        output.sets = exerciseObject.reps.length;
        // else throw Error;
        return output
      }
      function returnTotalSwitch(sid) {
        if (input.exercise === "ALL") {
          const exerciseCall = sessionList.find(
            (sess) => sess.sid === sid
          ).exercises;
          return exerciseCall
            .map((exercise) => {
              return totalMassRepsSets(returnExerciseObject(exercise, sid)); //should return an object of numerics: {mass: [for exercse]...}
            }) // The map becomes an array of objects for each exercise for this session: [{m, r, s}, {m,r,s}]
            .reduce((a, v) => {
              Object.keys(a).forEach(key=> a[key] += parseInt(v[key]))
              return a;
            }, {mass: 0, reps: 0, sets: 0}); // This can return an object of numeric primitives,each of which will then be pushed to an array.
        } else {
          return totalMassRepsSets(returnExerciseObject(input.exercise, sid)); //currently returning object of numerics for this session: {m,r,s}
        }
      }
      let output = {mass: [], reps: [], sets: []}
      if (input.interval === "SESSION") {
        /* return  */sessionListFiltered
          .map((sess) => sess.sid)
          .map((sid) => returnTotalSwitch(sid))
          .forEach(sess=> Object.keys(output).forEach(key=>output[key].push(sess[key])));
        return output // [session, session, session]... [{m, r, s}, {m, r, s}...  WANT to become: {m: [...], r: [...]...}
      } else if (["WEEK", "MONTH", "CUSTOM"].includes(input.interval)) {
        const sidsTagged = sessionListFiltered
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((v) => {
            return {
              sid: v.sid,
              interval: v.date,
            };
          });

        const categoryObject = {};
        const categoryArray = Array( //!!! MOBILE doesn't like the .at() component, try it with this: sidsTagged[sidsTagged.length - 1]
          getDifference(sidsTagged[0].interval, sidsTagged[sidsTagged.length - 1].interval) + 1
        )
          .fill(null)
          .map((v, i) =>
            input.interval === "MONTH"
              ? i
              : getCustomInterval(sidsTagged[0].interval) + i
          );

        categoryArray.forEach(
          (key) =>
            (categoryObject[key] = sidsTagged
              .filter((val) => {
                if (["WEEK", "CUSTOM"].includes(input.interval)) {
                  const yearDifference =
                    new Date(val.interval).getFullYear() -
                    new Date(sidsTagged[0].interval).getFullYear();
                  const intervalDifference =
                    getCustomInterval(val.interval) -
                    getCustomInterval(sidsTagged[0].interval);
                  const intervalsPerYear = 365.25 / (intervalLength[0] || 7);
                  const intervalsFromStart =
                    intervalDifference +
                    parseInt(yearDifference * intervalsPerYear);
                  return (
                    getCustomInterval(sidsTagged[0].interval) +
                      intervalsFromStart ===
                    key
                  );
                } else if (input.interval === "MONTH") {
                  const intervalDate = new Date(val.interval);
                  const firstDate = new Date(sidsTagged[0].interval);
                  const yearDifference =
                    intervalDate.getFullYear() - firstDate.getFullYear();
                  const monthDifference =
                    intervalDate.getMonth() - firstDate.getMonth();
                  const monthsFromStart = monthDifference + yearDifference * 12;
                  return monthsFromStart === key;
                } else throw Error;
              })
              .map((val) => val.sid))
        );
        return Object.values(categoryObject).map((array) => //should be an array of sids here
          array.reduce((acc, sid) => {
            const total = returnTotalSwitch(sid)
            Object.keys(acc).forEach(key=> acc[key] += total[key])
            return acc}, {mass: 0, reps: 0, sets: 0})  //array is reduced to an object with numerics... {m,r,s}
          //!
        ).reduce((a, v) => { // here we have an array of {m,r,s}... we want an object of arrays
          Object.keys(a).forEach(key=> a[key].push(v[key]))
          return a;
        }, {mass: [], reps: [], sets: []}); 
      }
    };
    const output = getDataset(input)
    const getLabels = (input) => {
      if (input.interval === "SESSION") {
        if (input.exercise === "ALL") {
          return sessionList.map((sess) => new Date(sess.date).toISOString());
        } else if (Object.keys(get).includes(input.exercise)) {
          return sessionListFiltered.map((sess) =>
            new Date(sess.date).toISOString()
          );
        }
      } else if (["WEEK", "MONTH", "CUSTOM"].includes(input.interval)) {
        const sorted = sessionListFiltered.sort(
          (a, b) => new Date(a) - new Date(b)
        );
        return Array(getDifference(sorted[0].date, sorted[sorted.length - 1].date) + 1) // changed out .at()
          .fill(null)
          .map((v, i) => {
            if (input.interval === "MONTH") {
              const initialDate = new Date(sorted[0].date);
              return `${((initialDate.getMonth() + i) % 12) + 1} - ${(
                initialDate.getFullYear() +
                Math.floor((initialDate.getMonth() + i) / 12)
              )
                .toString()
                .slice(2)}`;
            } else return getCustomInterval(sorted[0].date) + i;
          });
      }
    };
    return {
      labels: getLabels(input),
      datasets: [
        {
          yAxisID: "y",
          xAxisID: "x",
          label: "Tonnage (kg)",
          data: output.mass, //getDataset("mass", input)
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgb(75, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Reps",
          data: output.reps, //getDataset("reps", input)
          borderColor: "rgb(255, 192, 192)",
          backgroundColor: "rgb(255, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Sets",
          data: output.sets, //getDataset("sets", input)
          borderColor: "rgb(70, 255, 192)",
          backgroundColor: "rgb(70, 255, 192)",
          fill: false,
        },
      ],
    };
  }, [input, get, referenceDate, intervalLength, dataRange, varFilter]);

  const [data, setData] = useState(dataInitialiser);
  const [options, setOptions] = useState(optionsInitialiser(input.interval));

  useEffect(() => {
    setData(dataInitialiser);
    setOptions(optionsInitialiser(input.interval));
  }, [input, dataInitialiser]);

  function returnInputControls() {
    return (
      <>
        <label>
          Interval:&nbsp;
          <select
            onChange={(e) => setInput({ ...input, interval: e.target.value })}
          >
            <option>SESSION</option>
            <option>MONTH</option>
            <option>WEEK</option>
            <option>CUSTOM</option>
          </select>
        </label>
        
      </>
    );
  }

  function returnVarControls() {
    if (input.exercise === "ALL") return null;

    else {
      let variationsForUser = [];
      get[input.exercise].forEach((sess) =>
        sess.variation_templates.forEach(
          (template) => template.forEach(variation =>
          !!variation && !variationsForUser.includes(variation) &&
            variationsForUser.push(variation)
          )
        )
      )
      return (
      <>
         {variationsForUser.map(variation => 
            <label key={variation}>{variation}&nbsp;
              <input type="checkbox" onChange={(e)=> e.target.checked ? setVarFilter([...varFilter, variation]) : setVarFilter([...varFilter].filter(vari => vari !== variation))}/>
            </label>
         )}
      </>
    )
  }}

  function returnCustomControls() {
    if (input.interval !== "CUSTOM") return null;
    else
      return (
        <>
        <div className="what?">
            <label htmlFor={`IntervalLength`}>Interval Length:&nbsp;
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
          </label>
          <label htmlFor={`intervalLengthIn...`}>&nbsp;in...&nbsp;
          <select
            id={`intervalLengthIn...`}
            onChange={(e) =>
              setIntervalLength([intervalLength[0], e.target.value])
            }
            >
            <option value="DAYS">DAYS</option>
            <option value="WEEKS">WEEKS</option>
          </select>
          </label>
        </div>
          <label htmlFor={`BeginReferenceDate`}>&nbsp;Reference Date:&nbsp;
          <input
            id={`BeginReferenceDate`}
            type="date"
            max={dataRange.earliest}
            onChange={(e) =>
              e.target.value <= dataRange.earliest &&
              e.target.value.length === 10 &&
              setReferenceDate(e.target.value)
            }
            />
            </label>
        </>
      );
  }

  function returnDataRange() {
    return (
      <>
        <div>
          Date Range  &nbsp;
        </div>
        <label>
          From:&nbsp;
          <input
            type="date"
            defaultValue={dataRange.earliest}
            onChange={(e) =>
              setDataRange({ ...dataRange, earliest: e.target.value })
            }
          />
        </label>
        <label>
        To:&nbsp;
          <input
            type="date"
            defaultValue={dataRange.latest}
            onChange={(e) =>
              setDataRange({ ...dataRange, latest: e.target.value })
            }
          />
        </label>
        <label>
          Apply&nbsp;
          <input
            type="checkbox"
            onClick={() =>
              setDataRange({ ...dataRange, apply: !dataRange.apply })
            }
          />
        </label>
      </>
    );
  }

  return (
    <div className="graph_page_container_2" style={{}}>
      <div className="top_line">
        <label>
          Exercise:&nbsp;
          <select
            onChange={(e) => setInput({ ...input, exercise: e.target.value })}
          >
            <option value="ALL">All</option>
            {Object.keys(get).filter(key => key !== "sessions").sort().map((exercise)=> 
              <option key={`${exercise}_option`} value={`${exercise}`}>
                {exercise.split("_").map(
                  word=>word[0].toUpperCase() + word.slice(1)).join(" ")}</option>
            )}
          </select>
        </label>
        <div className="top_line variations">
        <div className="inner">
          {returnVarControls()}
        </div>
        </div>
      </div>
      <div className="middle_line">
        {returnInputControls()}
          <div className="data_range">
        <div className="inner">
          {returnDataRange()}
          </div>
        </div>
      </div>
      <div className="bottom_line">
        <div className="inner">
        {returnCustomControls()}
        </div>
      </div>
      <div className="graph_container">
      <Line options={options} data={data} />
      </div>
    </div>
  );
}
