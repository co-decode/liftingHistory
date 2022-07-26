import React, {useEffect, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Axios from 'axios'


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null)
  const link = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const callServer = useCallback( async () => {
    return Axios({
      method:"get",
      withCredentials: true,
      url: "http://localhost:3001/authenticated"
    }).then(res => {
      !!res.data && link('/main');
    })
  }, [link])
  


  // On mount, page should check whether the server has a session already running.
  useEffect(()=> {
    callServer()
    .then(()=>setLoading(false))
  },[callServer])

  const handleChangeUser = (e) => {
    setUsername(e.target.value)
  }
  const handleChangePass = (e) => {
    setPassword(e.target.value)
  }

  const login = () => {
    Axios({
      method:"post",
      data: {
        username,
        password
      },
      withCredentials: true,
      url:"http://localhost:3001/login"
    }).then(res=>setResponse(res.data?.message)).then(callServer)
  }

  

  return (
    <>
    {loading ? <p>"Awaiting server response..."</p> :
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
          <button type="submit" onClick={login}>Login</button>
        </div>
      <button onClick={() => link("/register")}>Go to Register</button>
      </>
    }
    </>
  );
}
