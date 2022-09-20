import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend } from "./utils/variables";
import Spinner from "./utils/Spinner";

export default function Logout() {
    const [loading, setLoading] = useState(false)
    const link = useNavigate();
    const logout = () => {
        setLoading(true)
        axios({
            method:"post",
            withCredentials: true,
            url:`${backend}/logout`
          }).then((res)=>{setLoading(false); link('/login')});
    }

    return(
        <>
            <button className="log_out" onClick={logout}>{loading ? <Spinner/> : `Log Out`}</button>
            
        </>
    )
}