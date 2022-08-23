import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { authenticatedKick, backend } from "./utils/variables";
import Spinner from "./utils/spinner";

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

  if (loading) return <><strong>Awaiting server response...</strong><Spinner/></>;

  return (
    <>
      <h1>Lifting Log</h1>
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
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          required
          onChange={(e) => handleChangePass(e)}
          />
      </div>
      <div>
        <button onClick={() => setShowPassword(!showPassword)}>{`${
          showPassword ? "Hide" : "Show"
        } Password`}</button>

        <button type="submit" onClick={register}>
          Register
        </button>
      </div>
      <button onClick={() => link("/login")}>Go to Login</button>
      <strong>{response}</strong>
    </>
  );
}
