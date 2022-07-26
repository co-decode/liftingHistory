import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import TestEdit from "./TestEdit";
import { useNavigate } from "react-router-dom";

export default function Test() {
    const [get, setGet] = useState(null)
    const [edit, setEdit] = useState(0)
    const [prevEdit, setPrevEdit] = useState(null)
    const [dateFilter, setDateFilter] = useState({
        from: null,
        to: null,
        ascending: true
    })
    const editRefs = useRef({});
    const link = useNavigate();

    useEffect(()=> {
        axios({
            method:"get",
            withCredentials: true,
            url: "http://localhost:3001/authenticated"
        }).then(res => {
            !res.data ? link('/login') :
            axios({
                method:"get",
                withCredentials: true,
                url:`http://localhost:3001/sessions/${res.data.uid}`
            }).then(res=> {
                console.log(res.data[0])
                setGet(res.data[0])
                const earliest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>a-b)[0])
                const latest = new Date(res.data[0].date.map(v=>new Date(v.date)).sort((a,b)=>b-a)[0])
                setDateFilter({
                    from: new Date(earliest.setTime(earliest.getTime() + 1 * 86400000)).toISOString().slice(0,10), 
                    to: new Date(latest.setTime(latest.getTime() + 2 * 86400000)).toISOString().slice(0,10),
                    ascending: true
                })
            })
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
                url:"http://localhost:3001/user/2"
            }).then(res=> {
                setGet(res.data[0])
            })
        })
    }

    function returnSid(get, from, to, ascending) {

        let sidList = get.date.filter(v=> v.date >= from && v.date <= to).map(v=>v.sid)

        if (!ascending) {sidList = sidList.reverse()}

        return (
            <div>
                {sidList.map(sidVal => {
                    let exerciseCall = get.date.filter(v => v.sid === sidVal)[0].exercises;
                    return (
                        <div key={sidVal} ref={(element) => {editRefs.current = {...editRefs.current, [sidVal]: element}}}>
                            <div>{new Date(get.date.filter(v => v.sid === sidVal)[0].date).toString()}</div>
                            <button onClick={()=>deleteSession(sidVal)}>Delete this session</button>
                            <button onClick={()=>setEdit(sidVal)}>Edit this session</button>
                            {exerciseCall.map(v => {
                                return (
                                    <div key={v}>
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
            {get?.date ? 
            <fieldset>
                <label htmlFor="from">From: </label>
                <input id="from" type="date" defaultValue={`${dateFilter.from}`} onChange={(e)=>setDateFilter({...dateFilter, from: e.target.value})} />
                <label htmlFor="to">To: </label>
                <input id="to" type="date" defaultValue={`${dateFilter.to}`} onChange={(e)=>setDateFilter({...dateFilter, to: e.target.value})}/>
                <button onClick={()=> setDateFilter({...dateFilter, ascending: !dateFilter.ascending})}>Reverse Order</button>
            </fieldset>
            : null}
            {edit ? <TestEdit get={get} setGet={setGet} edit={edit} setEdit={setEdit} /> 
                  : returnSid(get, dateFilter.from, dateFilter.to, dateFilter.ascending)}
            
        </div>
    )
}
