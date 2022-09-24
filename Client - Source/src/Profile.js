import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./utils/Spinner";
import { backend } from "./utils/variables";

export default function Profile({user}) {
    const [response, setResponse] = useState(null)
    const [input, setInput] = useState({1: null, 2: null})
    const [loading, setLoading] = useState(false)
    const link = useNavigate();

    useEffect(() => {
      setLoading(true)
        axios({
          method: "get",
          withCredentials: true,
          url: `${backend}/authenticated`,
        }).then((res) => {
          setLoading(false)
          if (!res.data) link("/login");
        });
      }, [link]);

    const handleSubmit = (e) => {
        e.preventDefault()
        if (input[1] !== input[2]) {
            setResponse("The passwords are not equal")
            return
        }
        else if (!input[1] || !input[2]) {
            setResponse("Cannot submit an empty field")
            return
        }
        setLoading(true)
        axios({
            method: "PUT",
            withCredentials: true,
            url: `${backend}/change/${user.uid}`,
            data: {password: input[1]}
        }).then(res=> {setResponse(res.data); setLoading(false)})
    }
  return (
    <div className="profile_container">
      <h1> Welcome, {user.username}</h1>
      <hr/>
      <form onSubmit={(e)=>handleSubmit(e)}>
        <label>
          New password:&nbsp;
          <input type="text" required onChange={(e)=> {setResponse(null); setInput({...input, 1: e.target.value})}}/>
        </label>
        <label>
          Confirm password:&nbsp;
          <input type="text" required onChange={(e)=> {setResponse(null); setInput({...input, 2: e.target.value})}}/>
        </label>
        <button>Submit Change</button>
      </form>
      {response}
      {loading && <Spinner/>}
    </div>
  );
}
