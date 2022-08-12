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
  const [input, setInput] = useState({interval: "SESSION", exercise: "ALL"});

  function optionsInitialiser(interval) {
    let x
    if (interval === "SESSION") x = {
      type: "time",
      time: {
        unit: "day",
      },
      grid: {
        drawOnChartArea: false,
      },
    }
    else if (interval !== "SESSION") x = {
      type: "category",
      grid: {
        drawOnChartArea: false,
      },
    }
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
    }
  }

    const dataInitialiser = useMemo(()=> { 
      function getCustomInterval(date) {
        const time = new Date(date);
        const onejan = new Date(time.getFullYear(), 0, 1);
        const referenceDate = /* begin ? new Date(begin) : */ onejan;
        const intervalLengthInDays = 7
        const interval = Math.ceil(
          (time.getTime() - referenceDate.getTime()) /
            86400000 /
            intervalLengthInDays
        );
        return interval;
      }
      const totalWhateverIWant = (what, input) => {
        if (input.exercise === "ALL") {
          const output = get.date
            .map((sess) => sess.sid)
            .map((sid) => {
              const exerciseCall = get.date
                .filter((sess) => sess.sid === sid)
                .map((v) => v.exercises)[0];
              return exerciseCall
                .map((exercise) => {
                  const item = get[exercise].find(
                    (entry) => entry.sid === sid
                  );
                  if (what === "mass") {
                    return item.reps.reduce((a, v, i) => a + v * item.mass[i]);
                  }
                  else if (what === "reps")
                    return item.reps.reduce((a, v) => {
                      return a + v;
                    });
                  else if (what === "sets") return item.reps.length;
                  else throw Error
                })
                .reduce((a, v) => {
                  return a + v;
                }, 0);
            });
            return output;
          } else if (input.interval === "SESSION")
          return get.date
            .filter((sess) => sess.exercises.includes(input.exercise))
            .map((sess) => sess.sid)
            .map((sid) => {
              const item = get[input.exercise].find((entry) => entry.sid === sid);
              if (what === "mass")
                return item.reps.reduce((a, v, i) => a + v * item.mass[i]);
              else if (what === "reps") return item.reps.reduce((a, v) => a + v);
              else if (what === "sets") return item.reps.length;
              else throw Error
            });
        else if (input.interval === "MONTH") {
          const sidsTagged = get.date
            .filter(sess => sess.exercises.includes(input.exercise))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((v) => {
              return {
                sid: v.sid,
                interval: `${new Date(v.date).getMonth() + 1}-${new Date(
                  v.date
                ).getFullYear()}`,
              };
            });
    
          const sidsBinned = sidsTagged.reduce((acc, v) => {
            return Object.keys(acc).includes(v.interval)
              ? { ...acc, [v.interval]: [...acc[v.interval], v.sid] }
              : { ...acc, [v.interval]: [v.sid] };
          }, {});
          return Object.keys(sidsBinned)
            .map(interval => sidsBinned[interval]
            .reduce((acc, sid) => {
              const exerciseObject = get[input.exercise].find((entry)=> entry.sid === sid)
              if (what === "mass")
                return acc + exerciseObject.reps.reduce((a, v, i) => a + v * exerciseObject.mass[i]);
              else if (what === "reps") return acc + exerciseObject.reps.reduce((a, v) => a + v);
              else if (what === "sets") return acc + exerciseObject.reps.length;
              else throw Error
            },0))
        }
        else if (input.interval === "WEEK") {
          
          const sidsTagged = get.date
            .filter(sess => sess.exercises.includes(input.exercise))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((v) => {
              return {
                sid: v.sid,
                interval: getCustomInterval(v.date)
              }
            });
    
          const difference = sidsTagged[sidsTagged.length - 1].interval - sidsTagged[0].interval
          const categoryObject = {}
          const categoryArray = Array(difference + 1).fill(null).map((v,i)=> sidsTagged[0].interval + i)
          categoryArray.forEach(key => categoryObject[key] = sidsTagged.filter(val => val.interval === key && val.sid))
    
          console.log(categoryArray)
    
    
          /* const sidsBinned = sidsTagged.reduce((acc, v) => {
            return Object.keys(acc).includes(v.interval)
              ? { ...acc, [v.interval]: [...acc[v.interval], v.sid] }
              : { ...acc, [v.interval]: [v.sid] };
          }, {}); */
          return Object.values(categoryArray).map(array => array
            .reduce((acc, sid) => {
              const exerciseObject = get[input.exercise].find((entry)=> entry.sid === sid)
              if (what === "mass")
                return acc + exerciseObject.reps.reduce((a, v, i) => a + v * exerciseObject.mass[i]);
              else if (what === "reps") return acc + exerciseObject.reps.reduce((a, v) => a + v);
              else if (what === "sets") return acc + exerciseObject.reps.length;
              else throw Error
            },0))
        }
      };
      const getLabels = (input) => {
        if (input.exercise === "ALL" && input.interval === "SESSION") {
          return get.date.map((sess) => new Date(sess.date).toISOString());
        } else if (input.exercise !== "ALL" && input.interval === "SESSION") {
          return get.date
            .filter((sess) => sess.exercises.includes(input.exercise))
            .map((sess) => new Date(sess.date).toISOString());
        } else if (input.interval === "MONTH") {
          const sorted = get.date.sort((a, b) => new Date(a) - new Date(b));
          return [new Date(sorted[0].date).getMonth() + 1, new Date(sorted[sorted.length - 1].date).getMonth()+1]
        } else if (input.interval === "WEEK") {
          const sorted = get.date.sort((a, b) => new Date(a) - new Date(b));
          const difference = getCustomInterval(sorted[sorted.length - 1].date) - getCustomInterval(sorted[0].date)
          const output = Array(difference + 1).fill(null).map((v,i)=> getCustomInterval(sorted[0].date) + i)
    
          return output
        }
      };
      return {
      labels: getLabels(input),
      datasets: [
        {
          yAxisID: "y",
          xAxisID: "x",
          label: "Tonnage (kg)",
          data: totalWhateverIWant("mass", input),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgb(75, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Reps",
          data: totalWhateverIWant("reps", input),
          borderColor: "rgb(255, 192, 192)",
          backgroundColor: "rgb(255, 192, 192)",
          fill: false,
        },
        {
          yAxisID: "y1",
          label: "Sets",
          data: totalWhateverIWant("sets", input),
          borderColor: "rgb(70, 255, 192)",
          backgroundColor: "rgb(70, 255, 192)",
          fill: false,
        },
      ],
    }}, [input, get])

  const [data, setData] = useState(dataInitialiser);
  const [options, setOptions] = useState(optionsInitialiser(input.interval))

  useEffect(() => {
    setData(dataInitialiser);
    setOptions(optionsInitialiser(input.interval))
  }, [input, dataInitialiser]);

  return (
    <div>
      <button onClick={()=> console.log(input)}>input</button>
      <fieldset>
        <label>
          Interval
          <select onChange={(e) => setInput({...input, interval: e.target.value})}>
            <option>SESSION</option>
            <option>MONTH</option>
            <option>WEEK</option>
          </select>
        </label>
        <label>
          Exercise
          <select onChange={(e) => setInput({...input, exercise: e.target.value})}>
            <option value="ALL">All</option>
            <option value="deadlift">Deadlift</option>
            <option value="squat">Squat</option>
            <option value="bench">Bench</option>
          </select>
        </label>
      </fieldset>
      <Line options={options} data={data} />
    </div>
  );
}
