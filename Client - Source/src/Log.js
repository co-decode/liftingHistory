import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Edit from "./Edit";
import Add from "./Add";
import Logout from "./Logout";
import Tonnage from "./Tonnage";
import Breakdown from "./Breakdown";
import Calendar from "./Calendar";
import Equivalence from "./Equivalence/Equivalence";
import Profile from "./Profile";
import { backend, variationObject } from "./utils/variables";
import Spinner from "./utils/Spinner";

const [PROFILE, LOG, EDIT, TONS, ADD, BREAK, CAL, EQUIV] = [
  "PROFILE",
  "LOG",
  "EDIT",
  "TONNAGE",
  "ADD",
  "BREAKDOWN",
  "CALENDAR",
  "EQUIVALENCE",
];

export default function Log() {
  const [get, setGet] = useState(null);
  const [edit, setEdit] = useState(0);
  const [page, setPage] = useState(LOG);
  const [prevEdit, setPrevEdit] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null,
    ascending: sessionStorage.getItem("WeightLiftingLogAscending") || true,
  });
  const [user, setUser] = useState(null);
  const [varFilter, setVarFilter] = useState({});
  const [goToMonthYear, setGoToMonthYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const editRefs = useRef({});
  const link = useNavigate();

  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: `${backend}/authenticated`,
    }).then((res) => {
      if (!res.data) link("/login");
      else {
        setUser(res.data);
        axios({
          method: "get",
          withCredentials: true,
          url: `${backend}/sessions/${res.data.uid}`,
        }).then((res) => {
          if (res.data.sessions) {
            setGet(res.data);
            const earliest = new Date(
              res.data.sessions
                .map((v) => new Date(v.date))
                .sort((a, b) => a - b)[0]
            );
            const latest = new Date(
              res.data.sessions
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

  useEffect(() => {
    if (page === LOG) setVarFilter({});
  }, [page]);

  function deleteSession(sid) {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    setLoading(true)
    axios({
      method: "delete",
      withCredentials: true,
      url: `${backend}/sessions/${sid}`,
    }).then((res) => {
      axios({
        method: "get",
        withCredentials: true,
        url: `${backend}/sessions/${user.uid}`,
      }).then((res) => {
        setLoading(false);
        setGet(res.data);
      });
    });
  }

  function returnSid() {
    let sidList = get.sessions
      .filter((v) => v.date >= dateFilter.from && v.date <= dateFilter.to)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((v) => v.sid);

    if (!dateFilter.ascending) {
      sidList = sidList.reverse();
    }

    return (
      <div>
        {sidList.map((sidVal) => {
          let exerciseCall = get.sessions.find((v) => v.sid === sidVal).exercises;
          if (
            exerciseCall.every((exercise) => {
              if (varFilter[exercise]) {
                return !get[exercise]
                  .filter((v) => v.sid === sidVal)[0]
                  .variation.includes(varFilter[exercise]);
              } else return false;
            })
          )
            return null;
          return (
            <div
              key={sidVal}
              ref={(element) => {
                editRefs.current = { ...editRefs.current, [sidVal]: element };
              }}
            >
              <div>
                {new Date(
                  get.sessions.filter((v) => v.sid === sidVal)[0].date
                ).toLocaleString()}
                <div>
                  <button onClick={() => deleteSession(sidVal)}>
                    Delete this session
                  </button>
                  <button
                    onClick={() => {
                      setEdit(sidVal);
                      setPage(EDIT);
                    }}
                  >
                    Edit this session
                  </button>
                  <button
                    onClick={() => {
                      setEdit(sidVal);
                      setPage(BREAK);
                    }}
                  >
                    View Breakdown
                  </button>
                </div>
              </div>
              {exerciseCall.map((v) => {
                const exerciseData = get[v].filter((v) => v.sid === sidVal)[0];
                if (varFilter[v])
                  if (!exerciseData.variation.includes(varFilter[v]))
                    return null;
                return (
                  <div
                    key={v}
                    style={{ display: "inline-block", marginRight: "20px" }}
                  >
                    <strong>{v.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}: </strong>
                    <div>
                      Max:{" "}
                      {exerciseData.mass.reduce((acc, item) => {
                        return item > acc ? item : acc;
                      })}{" "}
                      kg
                    </div>
                    <div>
                      Reps:{" "}
                      {exerciseData.reps.reduce((acc, val) => {
                        return val + acc;
                      })}
                    </div>
                    <div>Sets: {exerciseData.reps.length}</div>
                    <div>
                      Tonnage:{" "}
                      {exerciseData.reps.reduce((acc, rep, ind) => {
                        return parseInt(rep * exerciseData.mass[ind]) + acc;
                      }, 0)}{" "}
                      kg
                    </div>
                    <div>
                      {exerciseData.variation.toString().replace(/,/, ", ")}
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
    if (page === LOG) {
      return (
        <>
          <button onClick={() => setPage(ADD)}>Add an Entry</button>
          {get && (
            <>
              <button onClick={() => setPage(TONS)}>View Tonnage</button>
              <button onClick={() => setPage(CAL)}>View Calendar</button>
            </>
          )}
          <button onClick={() => setPage(EQUIV)}>View Calculator</button> <br />
          <button onClick={() => setPage(PROFILE)}>Change Password</button>
        </>
      );
    } else if (page) {
      return <button onClick={() => setPage(LOG)}>Go Back</button>;
    }
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
          onClick={() => {
            setDateFilter({
              ...dateFilter,
              ascending: !dateFilter.ascending,
            });
            sessionStorage.setItem(
              "WeightLiftingLogAscending",
              !dateFilter.ascending
            );
          }}
        >
          Reverse Order
        </button>
      </>
    );
  }
  function returnVarFilter() {
    return (
      <div>
        {Object.keys(get).filter(key => key !== "sessions").map((exercise) => (
          <div key={`${exercise}VarFilter`} style={{ display: "inline-block" }}>
            <label htmlFor={`${exercise}VarFilter`}>
              {exercise.split("_").map(word=> word[0].toUpperCase() + word.slice(1)).join(" ")}:
            </label>
            <select
              id={`${exercise}VarFilter`}
              onChange={(e) =>
                setVarFilter({
                  ...varFilter,
                  [exercise]: e.target.value,
                })
              }
            >
              <option value=""> Show All </option>
              <option value="HIDE"> Hide All </option>
              {variationObject[exercise].flat().map((value) => {
                return <option key={`${value}`}>{value}</option>;
              })}
            </select>
          </div>
        ))}
      </div>
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
                {returnVarFilter()}
              </fieldset>
              {returnSid()}
            </>
          ) : (
            "There's nothing here yet! Add some entries."
          )}
        </>
      );
    } else if (page === EDIT)
      return (
        <Edit
          get={get}
          setGet={setGet}
          edit={edit}
          setEdit={setEdit}
          setPage={setPage}
          user={user}
          setDateFilter={setDateFilter}
          dateFilter={dateFilter}
          />
      );
    else if (page === BREAK)
      return (
        <Breakdown
          get={get}
          edit={edit}
          setEdit={setEdit}
          setPage={setPage}
          setGoToMonthYear={setGoToMonthYear}
        />
      );
    else if (page === ADD)
      return (
        <Add
          get={get}
          setPage={setPage}
          setGet={setGet}
          setDateFilter={setDateFilter}
          dateFilter={dateFilter}
        />
      );
    else if (page === TONS) return <Tonnage get={get} />;
    else if (page === CAL)
      return (
        <Calendar
          get={get}
          setPage={setPage}
          setEdit={setEdit}
          goToMonthYear={goToMonthYear}
        />
      );
    else if (page === EQUIV) return <Equivalence />;
    else if (page === PROFILE) return <Profile user={user} />
    
  }

  if (get === null) return <><strong>Loading...</strong><Spinner/></>;

  return (
    <div>
      <h1>Lifting Log</h1>
      {loading && <Spinner/>}
      {pageButtons()}
      <Logout />
      {returnComponent()}
    </div>
  );
}
