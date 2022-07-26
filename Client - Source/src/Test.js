import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import TestEdit from "./TestEdit";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";

export default function Test() {
    const [get, setGet] = useState(null)
    const [edit, setEdit] = useState(0)
    const [prevEdit, setPrevEdit] = useState(null)
    const [dateFilter, setDateFilter] = useState({
        from: null,
        to: null,
        ascending: true
    })
    const [user, setUser] = useState(null)
    const editRefs = useRef({});
    const link = useNavigate();

    useEffect(()=> {
        axios({
            method:"get",
            withCredentials: true,
            url: "http://localhost:3001/authenticated"
        }).then(res => {
            if (!res.data) link('/login')
            else {
            setUser(res.data)
            axios({
                method:"get",
                withCredentials: true,
                url:`http://localhost:3001/sessions/${res.data.uid}`
            }).then(res=> {
                // console.log(res.data[0])
                if (res.data[0].date){
                    setGet(res.data[0])
                    const earliest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>a-b)[0])
                    const latest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>b-a)[0])
                    setDateFilter({
                        from: new Date(earliest.setTime(earliest.getTime())).toISOString().slice(0,10), 
                        to: new Date(latest.setTime(latest.getTime() + 2 * 86400000)).toISOString().slice(0,10),
                        ascending: true
                    })
                }
                else {
                    setGet(false)
                }
            })
            }
        })
    }, [link])

    useEffect(() => {
        if (edit > 0) {
            setPrevEdit(edit)
        }
        if (prevEdit && edit === 0) {
            editRefs.current[prevEdit]?.scrollIntoView()
        }
    }, [edit,prevEdit])

    function deleteSession(sid) {
        console.log("clicked")
        axios({
            method:"delete",
            withCredentials: true,
            url: `http://localhost:3001/sessions/${sid}`
        }).then(res=> {
            axios({
                method:"get",
                withCredentials: true,
                url:`http://localhost:3001/sessions/${user.uid}`
            }).then(res=> {
                setGet(res.data[0])
            })
        })
    }

    function returnSid(get, from, to, ascending) {

        let sidList = 
        get.date.filter(v=> v.date >= from && v.date <= to).sort((a,b)=>new Date(a.date) - new Date(b.date)).map(v=>v.sid)

        if (!ascending) {sidList = sidList.reverse()}

        return (
            <div>
                {sidList.map(sidVal => {
                    let exerciseCall = get.date.filter(v => v.sid === sidVal)[0].exercises;
                    return (
                        <div key={sidVal} ref={(element) => {editRefs.current = {...editRefs.current, [sidVal]: element}}}>
                            <div>{new Date(get.date.filter(v => v.sid === sidVal)[0].date).toLocaleString()}
                            <button onClick={()=>deleteSession(sidVal)}>Delete this session</button>
                            <button onClick={()=>setEdit(sidVal)}>Edit this session</button>
                            </div>
                            {exerciseCall.map(v => {
                                return (
                                    <div key={v} style={{display:"inline-block", marginRight:"20px"}}>
                                        <strong>{v[0].toUpperCase() + v.slice(1)}: </strong>
                                        <div>
                                            Mass: {get[v].filter(v => v.sid === sidVal)[0].mass}
                                        </div>
                                        <div>
                                            Reps: {get[v].filter(v => v.sid === sidVal)[0].reps}
                                        </div>
                                        <div>
                                            Sets: {get[v].filter(v => v.sid === sidVal)[0].sets}
                                        </div>
                                        <div>
                                            Scheme: {get[v].filter(v => v.sid === sidVal)[0].scheme}
                                        </div>
                                        <div>
                                            Variation: {get[v].filter(v => v.sid === sidVal)[0].variation}
                                        </div>
                                    </div>
                                )
                            })}
                            <hr/>
                        </div>
                    )}
                    )}
            </div>
        )
    }
    
    if (get === null) return <strong>Loading...</strong>;

    return (
        <div>
            <h1>Lifting Log</h1>
            <button onClick={()=>link('/testAdd')}>Add an Entry</button>
            <Logout />
            {edit ? <TestEdit get={get} setGet={setGet} edit={edit} setEdit={setEdit} />
                  : <>
                    {get ? <>
                    <fieldset>
                <label htmlFor="from">From: </label>
                <input id="from" type="date" defaultValue={`${dateFilter.from}`} onChange={(e)=>setDateFilter({...dateFilter, from: e.target.value})} />
                <label htmlFor="to">To: </label>
                <input id="to" type="date" defaultValue={`${dateFilter.to}`} onChange={(e)=>setDateFilter({...dateFilter, to: e.target.value})}/>
                <button onClick={()=> setDateFilter({...dateFilter, ascending: !dateFilter.ascending})}>Reverse Order</button>
                    </fieldset>
                    {returnSid(get, dateFilter.from, dateFilter.to, dateFilter.ascending)}
                    </> : "There's nothing here yet! Add some entries."}
                    </>}
            
        </div>
    )
}
