import React, { useEffect, useRef, useState } from "react";
import "./calendarCSS.css";
import * as d3 from "d3";
import {exerciseArray} from "./utils/variables"

export default function Calendar({ get, setPage, setEdit, goToMonthYear }) {
  const svgRef = useRef();
  const [colourState, setColourState] = useState(() => {
    let output ={}
    exerciseArray.forEach((exercise, ind) => 
      output[exercise] = JSON.parse(localStorage.getItem("liftingLogCalendarColors") || JSON.stringify({exercise: null}))[exercise] 
      || "#" + (parseInt("ffffff",  16) * Math.random()).toString(16).replace(/\.\w+$/, "").padStart(6, 0) /* + "50" */)
    return output
  })
  const colorStrings = [
    `#ff80ed`,
    `#065535`,
    `#000000`,
    `#133337`,
    `#ffc0cb`,
    `#ffffff`,
    `#ffe4e1`,
    `#008080`,
    `#ff0000`,
    `#e6e6fa`,
    `#ffd700`,
    `#ffa500`,
    `#00ffff`,
    `#ff7373`,
    `#0000ff`,
    `#40e0d0`,
    `#d3ffce`,
    `#c6e2ff`,
    `#b0e0e6`,
    `#f0f8ff`,
    `#666666`,
    `#faebd7`,
    `#bada55`,
    `#003366`,
    `#ffff00`,
    `#fa8072`,
    `#ffb6c1`,
    `#c0c0c0`,
    `#7fffd4`,
    `#800000`,
    `#800080`,
    `#c39797`,
    `#00ff00`,
    `#cccccc`,
    `#eeeeee`,
    `#f08080`,
    `#20b2aa`,
    `#fff68f`,
    `#333333`,
    `#ffc3a0`,
    `#66cdaa`,
    `#ff00ff`,
    `#ff6666`,
    `#c0d6e4`,
    `#ffdab9`,
    `#ff7f50`,
    `#cbbeb5`,
    `#afeeee`,
    `#468499`,
    `#00ced1`,
    `#008000`,
    `#f6546a`,
    `#b4eeb4`,
    `#b6fcd5`,
    `#0e2f44`,
    `#660066`,
    `#990000`,
    `#daa520`,
    `#6897bb`,
    `#000080`,
    `#f5f5f5`,
    `#808080`,
    `#696969`,
    `#088da5`,
    `#8b0000`,
    `#f5f5dc`,
    `#ffff66`,
    `#101010`,
    `#dddddd`,
    `#81d8d0`,
    `#8a2be2`,
    `#2acaea`,
    `#0a75ad`,
    `#ccff00`,
    `#ff4040`,
    `#66cccc`,
    `#420420`,
    `#ff1493`,
    `#00ff7f`,
    `#a0db8e`,
    `#cc0000`,
    `#3399ff`,
    `#794044`,
    `#999999`
  ]


  const sortedSessions = get.sessions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  // !!! MOBILE cannot handle the .at() function... use this instead: sortedSessions[sortedSessions.length-1]
  const mostRecentSessionDate = new Date(sortedSessions[sortedSessions.length-1].date);
  const [monthYearDate, setMonthYearDate] = useState(goToMonthYear || mostRecentSessionDate);


  

  useEffect(() => {
    function returnInitialOffset(days, startDay) {
      return days - startDay;
    }

    function shiftGetDay(getDay) {
      return getDay ? getDay - 1 : 6;
    }
    function dayNumber(i, ind) {
      const daysInRecentMonth = new Date(
        monthYearDate.getFullYear(),
        monthYearDate.getMonth() + 1,
        0
      ).getDate();
      const dayOfFirst = new Date(
        monthYearDate.getFullYear(),
        monthYearDate.getMonth(),
        1
      ).getDay();
      if (ind === 0 && i < shiftGetDay(dayOfFirst)) {
        // "prevMonth"
        // length = shiftGetDay(dayOfFirst)
        const daysInPreviousMonth = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth(),
          0
        ).getDate();
        return daysInPreviousMonth - (shiftGetDay(dayOfFirst) - 1) + i;
      } else if (
        i + 1 + ind * 7 >
        daysInRecentMonth + shiftGetDay(dayOfFirst)
      ) {
        // "nextMonth"
        // length = 42 - (daysInRecentMonth + shiftGetDay(dayOfFirst))
        return (
          ((i + ind * 7) % (daysInRecentMonth + shiftGetDay(dayOfFirst))) + 1
        );
      } else
        return (
          ((returnInitialOffset(daysInRecentMonth, shiftGetDay(dayOfFirst)) +
            i +
            ind * 7) %
            daysInRecentMonth) +
          1
        );
    }

    const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const data = sortedSessions
      .filter((sess) => {
        const sessionDate = new Date(sess.date);
        const firstOfMonth = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth(),
          1
        );
        const leftOffsetInDays = shiftGetDay(
          new Date(
            monthYearDate.getFullYear(),
            monthYearDate.getMonth(),
            1
          ).getDay()
        );
        const daysInMonth = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth() + 1,
          0
        ).getDate();
        const trailingDays = 42 - (daysInMonth + leftOffsetInDays);
        const nextMonthFirst = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth() + 1,
          1
        );
        return (
          sessionDate >=
            new Date(
              firstOfMonth.setTime(
                firstOfMonth.getTime() - leftOffsetInDays * 1000 * 60 * 60 * 24
              )
            ) &&
          sessionDate <
            new Date(
              nextMonthFirst.setTime(
                nextMonthFirst.getTime() + trailingDays * 1000 * 60 * 60 * 24
              )
            )
          /* CODE FOR SELECTING ONLY SESSIONS WITHIN THE MONTH
          sessionDate >=
            new Date(
              monthYearDate.getFullYear(),
              monthYearDate.getMonth(),
              1
            ) &&
          sessionDate <
            new Date(
              monthYearDate.getFullYear(),
              monthYearDate.getMonth() + 1,
              1
            ) */
        );
      })
      .map((sess) => {
        let sessionDate = new Date(sess.date);
        return {
          sid: sess.sid,
          exercises: sess.exercises,
          dayOfMonth: sessionDate.getDate(),
          dayOfWeek: sessionDate.getDay(),
        };
      });
    const dataObject = {};
    function convertDayToNumber(dayName) {
      const index = days.findIndex((day) => dayName === day);
      return (index + 1) % 7;
    }
    days.forEach(
      (dayName) =>
        (dataObject[dayName] = data.filter(
          (session) => session.dayOfWeek === convertDayToNumber(dayName)
        ))
    );
    const rectSize = 80;
    const { width, height } = {
      width: 800,
      height: 600,
    };
    const svg = d3
      .select(svgRef.current)
      .attr("width", "800px")
      .attr("height", height)
      .style("background-color", "grey");
    const x = d3
      .scaleLinear()
      .domain([0, Object.keys(dataObject).length])
      .range([0, width]);
    // const y = d3.scaleLinear().domain([0, Object.keys(dataObject).length]).range([0, height]);
    d3.selectAll("g > *").remove();
    d3.selectAll("defs").remove();
    d3.selectAll("text").remove();

    var defs = svg.append("defs"); // <-- For gradients 

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("fill", "black")
      .text(`${monthYearDate.getFullYear()} - ${monthYearDate.getMonth() + 1}`);
    svg
      .append("g")
      .selectAll("text")
      .data([0, 1])
      .join("text")
      .text((d) => (d ? ">" : "<"))
      .attr("x", (d) => /* width / 2 - 60 + 120 * d */ `${50 - 10 + 20 * d}%`)
      .attr("y", 18)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .style("cursor", "pointer")
      .on("click", (el, d) => {
        d
          ? setMonthYearDate(
              new Date(
                monthYearDate.getFullYear(),
                monthYearDate.getMonth() + 1,
                1
              )
            )
          : setMonthYearDate(
              new Date(
                monthYearDate.getFullYear(),
                monthYearDate.getMonth() - 1,
                1
              )
            );
      });

    svg
      .append("g")
      .selectAll("text")
      .data(Object.keys(dataObject))
      .join("text")
      .text((d) => `${d}`)
      .attr("x", (d, i) => x(i) + 0.5 * x(1))
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "19px");
    
    

    Object.values(dataObject).forEach((sessionArray, i) => {
      svg
        .append("g")
        .selectAll("rect")
        .data([0, 1, 2, 3, 4, 5])
        .join("rect")
        .attr("x", x(i) + 0.5 * (x(1) - rectSize))
        .attr("y", (d, j) => j * (rectSize + 10) + 60)
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("class", (d, ind) => `rectangle`)
        .attr("fill", (d, ind) => {
          const session = sessionArray.find(
            (session) => session.dayOfMonth === dayNumber(i, ind)
          );
          if (session) {
            var gradient = defs
              .append("linearGradient")
              .attr("id", `svgGradient${session.sid}`)
              .attr("x1", "0%")
              .attr("x2", "50%")
              .attr("y1", "50%")
              .attr("y2", "100%");

            function returnGradient() {
              session.exercises.forEach((exercise, ind) => {
                // console.log(exercise, colourForExercise[exercise])
                gradient
                  .append("stop")
                  .attr("offset", `${parseInt(ind * Math.round(100 / (session.exercises.length - 1 || 1)))}%`)
                  .attr("stop-color", `${colourState[exercise]}`)
                  .attr("stop-opacity", 1);
              })
            }
            returnGradient()

            return `url(#svgGradient${session.sid})`
            
          } else if (
            (!session &&
            ind === 0 &&
            i <
              shiftGetDay(
                new Date(
                  monthYearDate.getFullYear(),
                  monthYearDate.getMonth(),
                  1
                ).getDay()
              ))
            ||
            (!session &&
            i + 7 * ind >=
              shiftGetDay(
                new Date(
                  monthYearDate.getFullYear(),
                  monthYearDate.getMonth(),
                  1
                ).getDay()
              ) +
                new Date(
                  monthYearDate.getFullYear(),
                  monthYearDate.getMonth() + 1,
                  0
                ).getDate())
          ) {
            return "#00000050";
          } 
          /* else if (
            !session &&
            i + 7 * ind >=
              shiftGetDay(
                new Date(
                  monthYearDate.getFullYear(),
                  monthYearDate.getMonth(),
                  1
                ).getDay()
              ) +
                new Date(
                  monthYearDate.getFullYear(),
                  monthYearDate.getMonth() + 1,
                  0
                ).getDate()
          ) {
            return "#00000050";
          } */
          return "transparent";
        })
        .on("click", function (e, d) {
          const sid = sessionArray.find(
            (session) => session.dayOfMonth === dayNumber(i, d)
          )?.sid;
          if (sid) {
            setPage("BREAKDOWN");
            setEdit(sid);
          }
          return;
        });
    });

    Object.values(dataObject).forEach((date, i) => {
      svg
        .append("g")
        .selectAll("text")
        .data(Array(6))
        .join("text")
        .text((d, ind) => `${dayNumber(i, ind)}`)
        .attr("x", x(i) + 0.5 * x(1))
        .attr("y", (d, j) => j * (rectSize + 10) + 60 + 0.5 * rectSize)
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("pointer-events", "none")
        .style("font-size", "19px");
    });
  }, [sortedSessions, monthYearDate, setEdit, setPage, colourState]);

  return (
    <>
    <label> Go to: 
    <input type="date" onChange={(e)=>setMonthYearDate(new Date(e.target.value))}/>
    </label>
    <div>
      <svg ref={svgRef}></svg>
    </div> 
    {Object.keys(get).filter(key=> key !== "sessions").map(exercise => {
      if (colourState[exercise] === undefined) setColourState({...colourState, [exercise]: null})
      return (
          <label key={`color_${exercise}`}>{exercise
            .split("_")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}
            <select style={{backgroundColor: colourState[exercise] || colourState[exercise]}}
                    onChange={(e)=> setColourState({...colourState, [exercise]: e.target.value})}
                    defaultValue={JSON.parse(localStorage.getItem("liftingLogCalendarColors") || JSON.stringify({exercise: null}))[exercise] || colourState[exercise]}>
              {Object.values(colourState).reduce((acc, color)=> !acc.includes(color) ? [...acc, color] : acc, [])
                    .concat(colorStrings.filter(color=>!Object.values(colourState).includes(color)))
                    .map(color=> 
              <option key={`${exercise}${color}`} style={{backgroundColor: color}}>{color}</option>)}
            </select>
          </label>
        
      )
    })}
    <button onClick={()=>{localStorage.setItem("liftingLogCalendarColors", JSON.stringify(
      Object.keys(colourState)
      .filter(ex => Object.keys(get).filter(key=> key !== "sessions").includes(ex))
      .reduce((obj, ex) => obj = {...obj, [ex]: colourState[ex]},{})
    ))}}>
      Save colours
    </button>
    </>
  );
}
