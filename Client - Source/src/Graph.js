import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Graph({ get }) {
    const totalReps = get.date.filter(sess=>sess.exercises.includes("bench")).map(sess=> sess.sid).map(sid => {
        const item = get.bench.filter(entry=>entry.sid === sid)[0]
        return item.reps.reduce((a,v,i)=> a + v*item.mass[i])})
    const labels = get.date.filter(sess=>sess.exercises.includes("bench")).map(sess=>new Date(sess.date).toLocaleDateString())
    const values = totalReps
  const data = {
    labels,
    datasets: [
      {
        label: "go",
        data: values,
        borderColor: "rgb(75, 192, 192)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      title: {
        display: true,
        text: "Bench",
      },
    },
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
}
