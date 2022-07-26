import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true)
  const link = useNavigate();

  useEffect(()=> {
    Axios({
      method:"get",
      withCredentials: true,
      url: "http://localhost:3001/authenticated"
    }).then(res => {
      !!res.data && link('/main');
    })
    .then(()=>setLoading(false))
  },[link])

  const handleChangeUser = (e) => {
    setUsername(e.target.value)
    setResponse(null)
  }
  const handleChangePass = (e) => {
    setPassword(e.target.value)
    setResponse(null)
  }

  const register = () => {
    Axios({
      method:"post",
      data: {
        username,
        password
      },
      withCredentials: true,
      url:"http://localhost:3001/register"
    }).then(res=> {
      res.data === "Registration Successful" ?
      link('/login') :
      setResponse(res.data)}
      );
  }

  if (loading) return (<strong>Awaiting server response...</strong>)

  return (
    <>
    <strong>{response}</strong>
        <div>
          <label htmlFor="username">Username: </label>
          <input type="text" id="username" name="username" required onChange={e=>handleChangeUser(e)}/>
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input type="text" id="password" name="password" required onChange={e=>handleChangePass(e)}/>
        </div>
        <div>
          <button type="submit" onClick={register}>Register</button>
        </div>
      <button onClick={() => link("/login")}>Go to Login</button>
    </>
  );
}
