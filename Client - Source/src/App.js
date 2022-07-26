import Main from "./Main";
import Login from "./Login";
import Register from "./Register";
import Test from "./Test";
import TestAdd from "./TestAdd"
import axios from "axios";
import React, { useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// export const UserContext = createContext();

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
        <Route path="/main" element={<Main />} />
        <Route path="/test" element={<Test />}/>
        <Route path="/testAdd" element={<TestAdd />}/>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to={callServer ? "/main" : "/login"} replace/>} />
      </Routes>
  );
}
