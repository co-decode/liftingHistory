import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "./utils/variables";

export default function Profile({user}) {
    const [response, setResponse] = useState(null)
    const [input, setInput] = useState({1: null, 2: null})
    const link = useNavigate();

    useEffect(() => {
        axios({
          method: "get",
          withCredentials: true,
          url: `${backend}/authenticated`,
        }).then((res) => {
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
        axios({
            method: "PUT",
            withCredentials: true,
            url: `${backend}/change/${user.uid}`,
            data: {password: input[1]}
        }).then(res=> setResponse(res.data))
    }
  return (
    <>
      <h1> Welcome {user.username}</h1>
      <form onSubmit={(e)=>handleSubmit(e)}>
        <label>
          New password
          <input type="text" required onChange={(e)=> {setResponse(null); setInput({...input, 1: e.target.value})}}/>
        </label>
        <label>
          Confirm password
          <input type="text" required onChange={(e)=> {setResponse(null); setInput({...input, 2: e.target.value})}}/>
        </label>
        <button>Submit Change</button>
      </form>
      {response}
    </>
  );
}
