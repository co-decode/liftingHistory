import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Calendar({ get }) {
  const svgRef = useRef();
  const sortedSessions = get.date.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const mostRecentSessionDate = new Date(sortedSessions.at(-1).date);
  const sessionsForMostRecentMonth = get.date
    .filter((sess) => {
      const sessionDate = new Date(sess.date);
      return (
        sessionDate <=
          new Date(
            mostRecentSessionDate.getFullYear(),
            mostRecentSessionDate.getMonth() + 1,
            1
          ) &&
        sessionDate >=
          new Date(
            mostRecentSessionDate.getFullYear(),
            mostRecentSessionDate.getMonth(),
            1
          )
      );
    })
    .map((sess) => sess.date);

  const data = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  useEffect(() => {
    const rectSize = 80;
    const dimensions = {
      width: 800,
      height: 600,
    };
    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .style("background-color", "grey");
    const x = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, dimensions.width]);
    const y = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, dimensions.height]);

    svg
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => `${d}`)
      .attr("x", (d, i) => x(i))
      .attr("y", 50)
      .attr("fill", "black")
      .style("font-size", "19px");

    data.forEach((date, i) => {
      svg
      .append("g")
      .selectAll("text")
      .data(Array(6))
      .join("text")
      .text((d, ind) => `${((28 + i + ind * 7) % 31 + 1)}`)
      .attr("x", x(i))
      .attr("y", (d, j) => j * (rectSize +10) + 100)
      .attr("fill", "black")
      .style("font-size", "19px")
        /* .append("g")
        .selectAll("rect")
        .data(Array(5))
        .join("rect")
        .attr("x", x(i))
        .attr("y", (d, j) => j * (rectSize + 20) + 100)   
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("fill", (d, ind) => i % 2 === 0 ? 'red' : ind % 2 === 0 ? 'orange' : 'transparent')
        .attr("stroke-width", 2)
        .attr("stroke", (d, ind) => i % 2 === 0 ? 'black' : ind % 2 === 0 ? 'black' : 'transparent') */
    });
  }, [data]);

  return (
    <div>
      {console.log(data)}
      <svg ref={svgRef}></svg>
    </div>
  );
}
