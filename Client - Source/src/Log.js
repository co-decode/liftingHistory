import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Edit from "./Edit";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";
import Tonnage from "./Tonnage";

export default function Log() {
    const [get, setGet] = useState(null)
    const [edit, setEdit] = useState(0)
    const [tons, setTons] = useState(false)
    const [prevEdit, setPrevEdit] = useState(null)
    const [dateFilter, setDateFilter] = useState({
        from: null,
        to: null,
        ascending: true
    })
    const [user, setUser] = useState(null)
    const [exerciseFilter, setExerciseFilter] = useState([])
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
                        to: new Date(latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000)).toISOString().slice(0,10),
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
        get.date.filter(v=> v.date >= from && v.date <= to).filter(v=>exerciseFilter.every(exercise=>!v.exercises.includes(exercise))).sort((a,b)=>new Date(a.date) - new Date(b.date)).map(v=>v.sid)

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
                                            Max: {get[v].filter(v => v.sid === sidVal)[0].mass.reduce((acc, item) => {
                                                return item > acc ? item : acc
                                                })} kg
                                        </div>
                                        <div>
                                            Reps: {get[v].filter(v => v.sid === sidVal)[0].reps.reduce((acc, val) => {
                                                return val + acc
                                            })}
                                        </div>
                                        <div>
                                            Sets: {get[v].filter(v => v.sid === sidVal)[0].reps.length}
                                        </div>
                                        <div>
                                            Tonnage: {get[v].filter(v => v.sid === sidVal)[0].reps.reduce((acc, rep, ind) => {
                                                return parseInt(rep * get[v].filter(v => v.sid === sidVal)[0].mass[ind]) + acc
                                            }, 0)} kg
                                        </div>
                                        <div>
                                            {get[v].filter(v => v.sid === sidVal)[0].variation.toString().replace(/,/, ", ")}
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

    // function returnTonnage(get) {

    // }
    
    if (get === null) return <strong>Loading...</strong>;

    return (
        <div>
            <h1>Lifting Log</h1>
            <button onClick={()=>link('/Add')}>Add an Entry</button>
            <button onClick={()=>setTons(!tons)}>show Tonnage</button>
            <button onClick={()=>console.log(JSON.stringify(get))}>show get</button>
            <Logout />
            {edit ? <Edit get={get} setGet={setGet} edit={edit} setEdit={setEdit} user={user} setDateFilter={setDateFilter} />
                  : !tons ? <>
                    {get ? <>
                    <fieldset>
                <label htmlFor="from">From: </label>
                <input id="from" type="date" defaultValue={`${dateFilter.from}`} onChange={(e)=>setDateFilter({...dateFilter, from: e.target.value})} />
                <label htmlFor="to">To: </label>
                <input id="to" type="date" defaultValue={`${dateFilter.to}`} onChange={(e)=>setDateFilter({...dateFilter, to: e.target.value})}/>
                <button onClick={()=> setDateFilter({...dateFilter, ascending: !dateFilter.ascending})}>Reverse Order</button>
                {["bench", "deadlift", "squat"].map(val=>
                <div key={`${val}Check`} style={{display:"inline-block"}}>
                    <label htmlFor={`${val}Check`}>{val[0].toUpperCase() + val.slice(1)}</label>
                    <input type={`checkbox`} id={`${val}Check`} defaultChecked onClick={e=>{e.target.checked ? setExerciseFilter(exerciseFilter.filter(v=>v !== `${val}`)) : setExerciseFilter([...exerciseFilter, `${val}`]) }}/>
                </div>)}
                    </fieldset>
                    {returnSid(get, dateFilter.from, dateFilter.to, dateFilter.ascending)}
                    </> : "There's nothing here yet! Add some entries."}
                    </> : null}
            {!edit && tons ? 
            <>
                <Tonnage get={get} />
            </> 
            : null}
        </div>
    )
}
