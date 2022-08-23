import React, {useEffect, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Axios from 'axios'
import { authenticatedKick, backend } from "./utils/variables";
import Spinner from "./utils/Spinner";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [response, setResponse] = useState(null)
  const link = useNavigate();
  const [loading, setLoading] = useState(true);

  
  const callServer = useCallback( async () => {
    return Axios({
      method:"get",
      withCredentials: true,
      url: `${backend}/authenticated`
    }).then(res => {
      setLoading(false)
      !!res.data && link(authenticatedKick);
    })
  }, [link])
  


  // On mount, page should check whether the server has a session already running.
  useEffect(()=> {
    callServer()
  },[callServer])

  const handleChangeUser = (e) => {
    setUsername(e.target.value)
  }
  const handleChangePass = (e) => {
    setPassword(e.target.value)
  }

  const login = () => {
    setLoading(true)
    Axios({
      method:"post",
      data: {
        username,
        password
      },
      withCredentials: true,
      url:`${backend}/login`
    }).then(res=>{setResponse(res.data?.message)}).then(callServer)
  }

  

  return (
    <>
    {loading ? <><p>"Awaiting server response..."</p><Spinner/></> :
      <>
        <h1>Lifting Log</h1>
        <div>
          <label htmlFor="username">Username: </label>
          <input type="text" id="username" name="username" required onChange={e=>handleChangeUser(e)}/>
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input type={showPassword ? "text" : "password"} id="password" name="password" required onChange={e=>handleChangePass(e)}/>
        </div>
        <div>
        <button onClick={()=>setShowPassword(!showPassword)}>{`${showPassword ? "Hide" : "Show"} Password`}</button>
          <button type="submit" onClick={login}>Login</button>
        </div>
      <button onClick={() => link("/register")}>Go to Register</button>
      <strong>{response}</strong>
      </>
    }
    </>
  );
}
