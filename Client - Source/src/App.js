import Login from "./Login";
import Register from "./Register";
import Log from "./Log";
import axios from "axios";
import React, { useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  const callServer = useCallback( async () => {
    return axios({
      method:"get",
      withCredentials: true,
      url: "http://localhost:3001/authenticated"
    }).then(res => {
      return !!res.data
    })
  }, [])
  return (
      <Routes>
        <Route path="/log" element={<Log />}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to={callServer ? "/log" : "/login"} replace/>} />
      </Routes>
  );
}
