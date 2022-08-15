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
  const [dataRange, setDataRange] = useState({
    earliest: get.date
      .map((v) => new Date(v.date))
      .reduce((a, v) => (a <= v ? a : v))
      .toISOString()
      .slice(0, 10),
    latest: new Date(
      get.date
        .map((v) => new Date(v.date))
        .reduce((a, v) => (a >= v ? a : v))
        .setTime(
          get.date
            .map((v) => new Date(v.date))
            .reduce((a, v) => (a >= v ? a : v))
            .getTime() +
            34 * 60 * 60 * 1000
        )
    )
      .toISOString()
      .slice(0, 10),
    apply: false,
  });

  // const earliestSession = get.date
  //   .map((v) => new Date(v.date))
  //   .reduce((a, v) => (a <= v ? a : v));
  // const recentSession = get.date
  //   .map((v) => new Date(v.date))
  //   .reduce((a, v) => (a >= v ? a : v));

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
          type: "linear",
          display: "auto",
          position: "left",
          grid: {
            drawOnChartArea: true,
          },
          ticks: {
            stepSize: 1,
          },
          grace: "5%",
        },
        y: {
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
      const firstDate = new Date(first)
      const lastDate = new Date(last);
      if (input.interval === "MONTH") {
        const yearDifference =
        lastDate.getFullYear() - firstDate.getFullYear();
        const monthsBetween =
        lastDate.getMonth() - firstDate.getMonth() + yearDifference * 12;
        return monthsBetween;
        //
      } else if (["WEEK", "CUSTOM"].includes(input.interval)) {
        const yearDifference =
          lastDate.getFullYear() -
          firstDate.getFullYear();
        const intervalDifference =
          getCustomInterval(last) -
          getCustomInterval(first);
        const intervalsPerYear = 365.25 / (intervalLength[0] || 7);

        return (
          intervalDifference + parseInt(yearDifference * intervalsPerYear)
        );
      }
    }

    const sessionList = dataRange.apply
      ? get.date.filter(
          (sess) =>
            new Date(sess.date) >= new Date(dataRange.earliest) &&
            new Date(sess.date) <= new Date(dataRange.latest)
        )
      : get.date;

    const sessionListFiltered =
      input.exercise === "ALL"
        ? sessionList
        : sessionList.filter((sess) => sess.exercises.includes(input.exercise));
    const getDataset = (what, input) => {
      function returnExerciseObject(getWhat, sid) {
        return get[getWhat].find((entry) => entry.sid === sid);
      }
      function totalMassRepsSets(exerciseObject) {
        if (what === "mass") {
          return exerciseObject.reps.reduce(
            (a, v, i) => a + v * exerciseObject.mass[i],
            0
          );
        } else if (what === "reps")
          return exerciseObject.reps.reduce((a, v) => {
            return a + v;
          }, 0);
        else if (what === "sets") return exerciseObject.reps.length;
        else throw Error;
      }
      function returnTotalSwitch(sid) {
        if (input.exercise === "ALL") {
          const exerciseCall = sessionList.find(
            (sess) => sess.sid === sid
          ).exercises;
          return exerciseCall
            .map((exercise) => {
              return totalMassRepsSets(returnExerciseObject(exercise, sid));
            })
            .reduce((a, v) => {
              return a + v;
            }, 0);
        } else {
          return totalMassRepsSets(returnExerciseObject(input.exercise, sid));
        }
      }
      if (input.interval === "SESSION") {
        return sessionListFiltered
          .map((sess) => sess.sid)
          .map((sid) => returnTotalSwitch(sid));
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
/* 
        function getDifference() {
          if (input.interval === "MONTH") {
            const first = new Date(sidsTagged[0].interval);
            const latest = new Date(sidsTagged.at(-1).interval);
            const yearDifference = latest.getFullYear() - first.getFullYear();
            const monthsBetween =
            latest.getMonth() - first.getMonth() + yearDifference * 12;
            return monthsBetween;
            //
          } else if (["WEEK", "CUSTOM"].includes(input.interval)) {
            const yearDifference =
              new Date(sidsTagged.at(-1).interval).getFullYear() -
              new Date(sidsTagged[0].interval).getFullYear();
            const intervalDifference =
              getCustomInterval(sidsTagged.at(-1).interval) -
              getCustomInterval(sidsTagged[0].interval);
            const intervalsPerYear = 365.25 / (intervalLength[0] || 7);

            return (
              intervalDifference + parseInt(yearDifference * intervalsPerYear)
            );
          }
        } */
        const categoryObject = {};
        const categoryArray = Array(getDifference(sidsTagged[0].interval, sidsTagged.at(-1).interval) + 1)
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
                  const yearDifference =
                    new Date(val.interval).getFullYear() -
                    new Date(sidsTagged[0].interval).getFullYear();
                  const monthDifference =
                    new Date(val.interval).getMonth() -
                    new Date(sidsTagged[0].interval).getMonth();
                  const monthsFromStart = monthDifference + yearDifference * 12;
                  return monthsFromStart === key;
                } else throw Error;
              })
              .map((val) => val.sid))
        );
        return Object.values(categoryObject).map((array) =>
          array.reduce((acc, sid) => acc + returnTotalSwitch(sid), 0)
        );
      }
    };
    const getLabels = (input) => {
      if (input.interval === "SESSION") {
        if (input.exercise === "ALL") {
          return sessionList.map((sess) => new Date(sess.date).toISOString());
        } else if (["deadlift", "squat", "bench"].includes(input.exercise)) {
          return sessionListFiltered.map((sess) =>
            new Date(sess.date).toISOString()
          );
        }
      } else if (["WEEK", "MONTH", "CUSTOM"].includes(input.interval)) {
        const sorted = sessionListFiltered.sort(
          (a, b) => new Date(a) - new Date(b)
        );
        const initialDate = new Date(sorted[0].date);
        /* function getDifference() {
          if (input.interval === "MONTH") {
            const latest = new Date(sorted.at(-1).date);
            const yearDifference =
            latest.getFullYear() - initialDate.getFullYear();
            const monthsBetween =
            latest.getMonth() - initialDate.getMonth() + yearDifference * 12;
            return monthsBetween;
            //
          } else if (["WEEK", "CUSTOM"].includes(input.interval)) {
            const yearDifference =
              new Date(sorted.at(-1).date).getFullYear() -
              initialDate.getFullYear();
            const intervalDifference =
              getCustomInterval(sorted.at(-1).date) -
              getCustomInterval(sorted[0].date);
            const intervalsPerYear = 365.25 / (intervalLength[0] || 7);

            return (
              intervalDifference + parseInt(yearDifference * intervalsPerYear)
            );
          }
        } */
        const output = Array(getDifference(sorted[0].date, sorted.at(-1).date) + 1)
          .fill(null)
          .map((v, i) => {
            if (input.interval === "MONTH") {
              return `${((initialDate.getMonth() + i) % 12) + 1} - ${(
                initialDate.getFullYear() +
                Math.floor((initialDate.getMonth() + i) / 12)
              )
                .toString()
                .slice(2)}`;
            } else return getCustomInterval(sorted[0].date) + i;
          });
        return output;
      }
    };
    return {
      labels: getLabels(input),
      datasets: [
        {
          yAxisID: "y",
          xAxisID: "x",
          label: "Tonnage (kg)",
          data: getDataset("mass", input),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgb(75, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Reps",
          data: getDataset("reps", input),
          borderColor: "rgb(255, 192, 192)",
          backgroundColor: "rgb(255, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Sets",
          data: getDataset("sets", input),
          borderColor: "rgb(70, 255, 192)",
          backgroundColor: "rgb(70, 255, 192)",
          fill: false,
        },
      ],
    };
  }, [input, get, referenceDate, intervalLength, dataRange]);

  const [data, setData] = useState(dataInitialiser);
  const [options, setOptions] = useState(optionsInitialiser(input.interval));

  useEffect(() => {
    setData(dataInitialiser);
    setOptions(optionsInitialiser(input.interval));
  }, [input, dataInitialiser]);

  return (
    <div>
      <fieldset>
        <label>
          Interval
          <select
            onChange={(e) => setInput({ ...input, interval: e.target.value })}
          >
            <option>SESSION</option>
            <option>MONTH</option>
            <option>WEEK</option>
            <option>CUSTOM</option>
          </select>
        </label>
        <label>
          Exercise
          <select
            onChange={(e) => setInput({ ...input, exercise: e.target.value })}
          >
            <option value="ALL">All</option>
            <option value="deadlift">Deadlift</option>
            <option value="squat">Squat</option>
            <option value="bench">Bench</option>
          </select>
        </label>
        {input.interval === "CUSTOM" && (
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
              max={dataRange.earliest}
              onChange={(e) =>
                e.target.value <= dataRange.earliest &&
                e.target.value.length === 10 &&
                setReferenceDate(e.target.value)
              }
            />
          </>
        )}
        <div>
          <label>
            From:
            <input
              type="date"
              defaultValue={dataRange.earliest}
              onChange={(e) =>
                setDataRange({ ...dataRange, earliest: e.target.value })
              }
            />
          </label>
          <label>
            To:
            <input
              type="date"
              defaultValue={dataRange.latest}
              onChange={(e) =>
                setDataRange({ ...dataRange, latest: e.target.value })
              }
            />
          </label>
          <label>
            {" "}
            Apply Date Range
            <input
              type="checkbox"
              onClick={() =>
                setDataRange({ ...dataRange, apply: !dataRange.apply })
              }
            />
          </label>
        </div>
      </fieldset>
      <Line options={options} data={data} />
    </div>
  );
}
