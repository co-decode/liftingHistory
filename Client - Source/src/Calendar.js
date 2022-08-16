import React, { useEffect, useRef } from "react";
import "./calendarCSS.css";
import * as d3 from "d3";

export default function Calendar({ get, setPage, setEdit }) {
  const svgRef = useRef();
  const sortedSessions = get.date.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const mostRecentSessionDate = new Date(sortedSessions.at(-1).date);
  // const mostRecentSessionDate = new Date(2022, 0 , 1);

  function returnInitialOffset(days, startDay) {
    return days - startDay;
  }

  function shiftGetDay(getDay) {
    return getDay ? getDay - 1 : 6;
  }

  function dayNumber(i, ind) {
    const daysInRecentMonth = new Date(
      mostRecentSessionDate.getFullYear(),
      new Date(mostRecentSessionDate).getMonth() + 1,
      0
    ).getDate();
    const dayOfFirst = new Date(
      mostRecentSessionDate.getFullYear(),
      new Date(mostRecentSessionDate).getMonth(),
      1
    ).getDay();
    if (ind === 0 && i < shiftGetDay(dayOfFirst)) {
      // "prevMonth"
      // length = shiftGetDay(dayOfFirst)
      const daysInPreviousMonth = new Date(
        mostRecentSessionDate.getFullYear(),
        mostRecentSessionDate.getMonth(),
        0
      ).getDate();
      return daysInPreviousMonth - (shiftGetDay(dayOfFirst) - 1) + i;
    } else if (i + 1 + ind * 7 > daysInRecentMonth + shiftGetDay(dayOfFirst)) {
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
  // const days = [{day: "Mo", sessions: [{sid, date}, {sid, date}]}, "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const data = sortedSessions
    .filter((sess) => {
      const sessionDate = new Date(sess.date);
      return (
        sessionDate >=
          new Date(
            mostRecentSessionDate.getFullYear(),
            mostRecentSessionDate.getMonth(),
            1
          ) &&
        sessionDate <
          new Date(
            mostRecentSessionDate.getFullYear(),
            mostRecentSessionDate.getMonth() + 1,
            1
          )
      );
    })
    .map((sess) => {
      let sessionDate = new Date(sess.date);
      return {
        sid: sess.sid,
        dayOfMonth: sessionDate.getDate(),
        dayOfWeek: sessionDate.getDay(),
      };
    })
    const dataObject = {}
    function convertDayToNumber(dayName) {
      const index = days.findIndex((day) => dayName === day)
      return (index + 1) % 7
    }
    days.forEach(dayName => dataObject[dayName] = data.filter(session => session.dayOfWeek === convertDayToNumber(dayName) ) )

    console.log(data.filter(session => session.dayOfWeek === convertDayToNumber("Su") ))
    console.log('data', data)
    console.log(dataObject)

  useEffect(() => {
    const rectSize = 80;
    const { width, height } = {
      width: 800,
      height: 600,
    };
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "grey");
    const x = d3.scaleLinear().domain([0, days.length]).range([0, width]);
    const y = d3.scaleLinear().domain([0, days.length]).range([0, height]);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("fill", "black")
      .text(
        `${mostRecentSessionDate.getFullYear()} - ${
          mostRecentSessionDate.getMonth() + 1
        }`
      );

    svg
      .append("g")
      .selectAll("text")
      .data(days)
      .join("text")
      .text((d) => `${d}`)
      .attr("x", (d, i) => x(i) + 0.5 * x(1))
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "19px");

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
        .style("font-size", "19px");
    });
    Object.values(dataObject).forEach((sessionArray, i) => {
      svg
        .append("g")
        .selectAll("rect")
        .data(Array(6).fill(null))
        .join("rect")
        .attr("x", x(i) + 0.5 * (x(1) - rectSize))
        .attr("y", (d, j) => j * (rectSize + 10) + 60)
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("class", (d, ind) => `${i}-${ind} rectangle`)
        .attr("fill", (d, ind) => sessionArray.find(session => session.dayOfMonth === dayNumber(i, ind)) ? "#ffffff50" :  "transparent")
        .on("click", () => {
          setPage("BREAKDOWN");
          setEdit(36);
        });
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
