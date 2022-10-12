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
  const [screenWidth, setScreenWidth] = useState()
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

  useEffect(() => {
    function resizeListener() {
      const width = window.innerWidth
      setScreenWidth(width)
    }
    window.addEventListener("resize", resizeListener, {passive:true})
    return () =>{ 
      window.removeEventListener("resize", resizeListener)
    }
  },[])

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
    <div className="navbar">
      <h1>Lifting Log</h1>
    {loading && 
    <div className="login_loading">
      <Spinner/>
      <p>Awaiting server response...</p>
    </div>}
    </div>
    <div className="login_container">
      <h1>{screenWidth < 500 ? "Existing Account" : "Login with an existing account"}</h1>
      <div>
        <label htmlFor="username">Username: </label>
        <input type="text" id="username" name="username" required onChange={e=>handleChangeUser(e)}/>
      </div>
      <div>
        <label htmlFor="password">Password: </label>
        <span>
        <input type={showPassword ? "text" : "password"} id="password" name="password" required onChange={e=>handleChangePass(e)}/>
      <button className="show_password" onClick={(e)=>{e.target.classList.toggle("eye_shut"); setShowPassword(!showPassword)}}>
      </button>
        </span>
      </div>
      <div className="button_container">
        <button className="login_register" type="submit" onClick={login}>Login</button>
        <button className="to_register_login" onClick={() => link("/register")}>New Account</button>
      </div>
    </div>
    <strong>{response}</strong>
    <div className="preload"> 
      <button className="show_password eye_shut"/>
    </div>
  </>
  );
}
