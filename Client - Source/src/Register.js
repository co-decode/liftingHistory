import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { authenticatedKick, backend } from "./utils/variables";
import Spinner from "./utils/Spinner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const link = useNavigate();

  useEffect(() => {
    Axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    })
      .then((res) => {
        !!res.data && link(authenticatedKick);
      })
      .then(() => setLoading(false));
  }, [link]);

  const handleChangeUser = (e) => {
    setUsername(e.target.value);
    setResponse(null);
  };
  const handleChangePass = (e) => {
    setPassword(e.target.value);
    setResponse(null);
  };

  const register = () => {
    setLoading(true)
    Axios({
      method: "post",
      data: {
        username,
        password,
      },
      withCredentials: true,
      url: `${backend}/register`,
    }).then((res) => {
      setLoading(false);
      res.data === "Registration Successful"
        ? link("/login")
        : setResponse(res.data);
    });
  };

  // if (loading) return <><strong>Awaiting server response...</strong><Spinner/></>;

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
          <h1>Register a New Account</h1>
        <div>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            onChange={(e) => handleChangeUser(e)}
            />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            onChange={(e) => handleChangePass(e)}
            />
          <button className="show_password" onClick={(e)=>{e.target.classList.toggle("eye_shut"); setShowPassword(!showPassword)}}>
          </button>
          </span>
        </div>
          {/* <button onClick={() => setShowPassword(!showPassword)}>{`${
            showPassword ? "Hide" : "Show"
          } Password`}</button> */}

        <div className="button_container">
          <button className="login_register" type="submit" onClick={register}>
            Register
          </button>
        <button className="to_register_login" onClick={() => link("/login")}>Cancel</button>
        </div>
      </div>
      <strong>{response}</strong>
    </>
  );
}
