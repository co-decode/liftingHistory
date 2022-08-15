import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Calendar({get}) {
    const svgRef = useRef()
    const data = get.date.map(sess =>sess.date.slice(0,10))
    useEffect(() => {
        const rectSize = 30 
        const dimensions = {
            width: 800,
            height: 600
        }
        const svg = d3.select(svgRef.current)
                        .attr('width', dimensions.width)
                        .attr('height', dimensions.height)
                        .style('background-color', 'grey')
        const x = d3.scaleLinear()
                    .domain([0, data.length])
                    .range([0, dimensions.width])
        svg.append('g')
            .selectAll('text')
            .data(data)
            .join('text')
            .text(d => `${d}`)
            .attr('x', (d,i) => x(i) + 2)
            .attr('y', dimensions.height - 2)
            .attr('fill', 'white')
            .style('font-size', '8px')

        data.forEach((date, i) => {
            svg.append('g')
                .selectAll('rect')
                .data(Array(14))
                .join('rect')
                .attr('x', x(i) + 0.5*rectSize)
                .attr('y', (d, j) => j * (dimensions.height / 14) + 2)
                .attr('width', rectSize)
                .attr('height', rectSize)
                .attr('fill', 'red')
        })  
    }, [data])
    
    return (
        <div>
            <svg ref={svgRef}>

            </svg>
        </div>
    )
}