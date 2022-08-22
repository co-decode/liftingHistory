import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend } from "./utils/variables";

export default function Logout() {
    const link = useNavigate();
    const logout = () => {
        axios({
            method:"post",
            withCredentials: true,
            url:`${backend}/logout`
          }).then((res)=>link('/login'));
    }

    return(
        <>
            <button onClick={logout}>Log Out</button>
        </>
    )
}