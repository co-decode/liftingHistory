import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Edit from "./Edit";
import Add from "./Add";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";
import Tonnage from "./Tonnage";
import Breakdown from "./Breakdown"

const [LOG, EDIT, TONS, ADD, BREAK] = ["LOG", "EDIT", "TONNAGE", "ADD", "BREAKDOWN"];

export default function Log() {
  const [get, setGet] = useState(null);
  const [edit, setEdit] = useState(0);
  const [page, setPage] = useState(LOG);
  const [prevEdit, setPrevEdit] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null,
    ascending: true,
  });
  const [user, setUser] = useState(null);
  const [exerciseFilter, setExerciseFilter] = useState([]);
  const editRefs = useRef({});
  const link = useNavigate();

  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: "http://localhost:3001/authenticated",
    }).then((res) => {
      if (!res.data) link("/login");
      else {
        setUser(res.data);
        axios({
          method: "get",
          withCredentials: true,
          url: `http://localhost:3001/sessions/${res.data.uid}`,
        }).then((res) => {
          // console.log(res.data[0])
          if (res.data[0].date) {
            setGet(res.data[0]);
            const earliest = new Date(
              res.data[0].date
                .map((v) => new Date(v.date))
                .sort((a, b) => a - b)[0]
            );
            const latest = new Date(
              res.data[0].date
                .map((v) => new Date(v.date))
                .sort((a, b) => b - a)[0]
            );
            setDateFilter({
              from: new Date(earliest.setTime(earliest.getTime()))
                .toISOString()
                .slice(0, 10),
              to: new Date(
                latest.setTime(latest.getTime() + 34 * 60 * 60 * 1000)
              )
                .toISOString()
                .slice(0, 10),
              ascending: true,
            });
          } else {
            setGet(false);
          }
        });
      }
    });
  }, [link]);

  useEffect(() => {
    if (edit > 0) {
      setPrevEdit(edit);
    }
    if (prevEdit && edit === 0) {
      editRefs.current[prevEdit]?.scrollIntoView();
    }
  }, [edit, prevEdit]);

  function deleteSession(sid) {
    console.log("clicked");
    axios({
      method: "delete",
      withCredentials: true,
      url: `http://localhost:3001/sessions/${sid}`,
    }).then((res) => {
      axios({
        method: "get",
        withCredentials: true,
        url: `http://localhost:3001/sessions/${user.uid}`,
      }).then((res) => {
        setGet(res.data[0]);
      });
    });
  }

  function returnSid() {
    let sidList = get.date
      .filter((v) => v.date >= dateFilter.from && v.date <= dateFilter.to)
      .filter((v) =>
        exerciseFilter.every((exercise) => !v.exercises.includes(exercise))
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((v) => v.sid);

    if (!dateFilter.ascending) {
      sidList = sidList.reverse();
    }

    return (
      <div>
        {sidList.map((sidVal) => {
          let exerciseCall = get.date.filter((v) => v.sid === sidVal)[0]
            .exercises;
          return (
            <div
              key={sidVal}
              ref={(element) => {
                editRefs.current = { ...editRefs.current, [sidVal]: element };
              }}
            >
              <div>
                {new Date(
                  get.date.filter((v) => v.sid === sidVal)[0].date
                ).toLocaleString()}
                <button onClick={() => deleteSession(sidVal)}>
                  Delete this session
                </button>
                <button onClick={() => {setEdit(sidVal); setPage(EDIT)}}>
                  Edit this session
                </button>
                <button onClick={() => {setEdit(sidVal); setPage(BREAK)}}>
                  View Breakdown
                </button>
              </div>
              {exerciseCall.map((v) => {
                return (
                  <div
                    key={v}
                    style={{ display: "inline-block", marginRight: "20px" }}
                  >
                    <strong>{v[0].toUpperCase() + v.slice(1)}: </strong>
                    <div>
                      Max:{" "}
                      {get[v]
                        .filter((v) => v.sid === sidVal)[0]
                        .mass.reduce((acc, item) => {
                          return item > acc ? item : acc;
                        })}{" "}
                      kg
                    </div>
                    <div>
                      Reps:{" "}
                      {get[v]
                        .filter((v) => v.sid === sidVal)[0]
                        .reps.reduce((acc, val) => {
                          return val + acc;
                        })}
                    </div>
                    <div>
                      Sets:{" "}
                      {get[v].filter((v) => v.sid === sidVal)[0].reps.length}
                    </div>
                    <div>
                      Tonnage:{" "}
                      {get[v]
                        .filter((v) => v.sid === sidVal)[0]
                        .reps.reduce((acc, rep, ind) => {
                          return (
                            parseInt(
                              rep *
                                get[v].filter((v) => v.sid === sidVal)[0].mass[
                                  ind
                                ]
                            ) + acc
                          );
                        }, 0)}{" "}
                      kg
                    </div>
                    <div>
                      {get[v]
                        .filter((v) => v.sid === sidVal)[0]
                        .variation.toString()
                        .replace(/,/, ", ")}
                    </div>
                  </div>
                );
              })}
              <hr />
            </div>
          );
        })}
      </div>
    );
  }
  function pageButtons() {
    if (page === LOG) {return (
    <>
        <button onClick={()=>setPage(ADD)}>Add an Entry</button>
        <button onClick={()=>setPage(TONS)}>View Tonnage</button>
    </>
    )}
    else if (page) return <button onClick={()=>setPage(LOG)}>Go Back</button>
  }
  function returnDateFilter() {
    return (
      <>
        <label htmlFor="from">From: </label>
        <input
          id="from"
          type="date"
          defaultValue={`${dateFilter.from}`}
          onChange={(e) =>
            setDateFilter({ ...dateFilter, from: e.target.value })
          }
        />
        <label htmlFor="to">To: </label>
        <input
          id="to"
          type="date"
          defaultValue={`${dateFilter.to}`}
          onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
        />
        <button
          onClick={() =>
            setDateFilter({
              ...dateFilter,
              ascending: !dateFilter.ascending,
            })
          }
        >
          Reverse Order
        </button>
      </>
    );
  }
  function returnExFilter() {
    return (
      <>
        {["bench", "deadlift", "squat"].map((val) => (
          <div key={`${val}Check`} style={{ display: "inline-block" }}>
            <label htmlFor={`${val}Check`}>
              {val[0].toUpperCase() + val.slice(1)}
            </label>
            <input
              type={`checkbox`}
              id={`${val}Check`}
              defaultChecked
              onClick={(e) => {
                e.target.checked
                  ? setExerciseFilter(
                      exerciseFilter.filter((v) => v !== `${val}`)
                    )
                  : setExerciseFilter([...exerciseFilter, `${val}`]);
              }}
            />
          </div>
        ))}
      </>
    );
  }

  function returnComponent() {
    if (page === LOG) {
      return (
        <>
          {get ? (
            <>
              <fieldset>
                {returnDateFilter()}
                {returnExFilter()}
              </fieldset>
              {returnSid()}
            </>
          ) : (
            "There's nothing here yet! Add some entries."
          )}
        </>
      );
    }
    else if (page === EDIT)
      return (
        <Edit
          get={get}
          setGet={setGet}
          edit={edit}
          setEdit={setEdit}
          setPage={setPage}
          user={user}
          setDateFilter={setDateFilter}
        />
      );
    else if (page === BREAK) return <Breakdown get={get} edit={edit}/>
    else if (page === ADD) return <Add get={get} />;
    else if (page === TONS) return <Tonnage get={get} />;
  }

  if (get === null) return <strong>Loading...</strong>;

  return (
    <div>
      <h1>Lifting Log</h1>
      {/* <button onClick={() => console.log(JSON.stringify(get), edit)}>show get</button> */}
      {pageButtons()}
      <Logout />
      {returnComponent()}
    </div>
  );
}
