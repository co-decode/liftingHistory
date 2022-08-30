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
  const [varMenus, setVarMenus] = useState({});
  const checkRefs = useRef({});
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
            const exercisesForUser = Object.keys(res.data).filter(
              (key) => key !== "sessions"
            );
            function initialFilter() {
              let output = {};
              exercisesForUser.forEach((exercise) => (output[exercise] = []));
              return output;
            }
            setVarFilter(initialFilter());
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
    if (page === LOG);
  }, [page]);

  function deleteSession(sid) {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    const exerciseArray = get.sessions.find(sess => sess.sid === sid).exercises
    setLoading(true);
    axios({
      method: "delete",
      data: exerciseArray,
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
          let exerciseCall = get.sessions.find(
            (v) => v.sid === sidVal
          ).exercises;
          if (
            exerciseCall.every((exercise) =>{
              return varFilter[exercise].includes("HIDE")
            }) )
            return null;

          
          if (exerciseCall.every((exercise) => {
            if (!varFilter[exercise].length ) return false; 
            return !varFilter[exercise].some(vari => get[exercise].find(sess => sess.sid === sidVal).variation.includes(vari))
          })) return null
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
                const exerciseData = get[v].find((v) => v.sid === sidVal);
                if (varFilter[v].length > 0)
                  if (
                    varFilter[v].every(
                      (vari) => !exerciseData.variation.includes(vari)
                    )
                  )
                    return null;
                return (
                  <div
                    key={v}
                    style={{ display: "inline-block", marginRight: "20px" }}
                  >
                    <strong>
                      {v
                        .split("_")
                        .map((word) => word[0].toUpperCase() + word.slice(1))
                        .join(" ")}
                      :{" "}
                    </strong>
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

    function handleHideAll() {
      let newVariationFilter = {};
      if (
        Object.keys(get).filter((key) => key !== "sessions").every((exercise) =>
          varFilter[exercise].includes("HIDE")
        )
      ) {
        Object.keys(get).filter((key) => key !== "sessions").forEach(
          (exercise) => (newVariationFilter[exercise] = [])
        );
      } else {
        Object.keys(get).filter((key) => key !== "sessions").forEach(
          (exercise) => (newVariationFilter[exercise] = ["HIDE"])
        );
        let newVarMenus = {...varMenus}
        Object.keys(newVarMenus).forEach(exercise=> newVarMenus = {...newVarMenus, [exercise]: false})
        setVarMenus(newVarMenus)
      }
      setVarFilter(newVariationFilter);
    }
    return (
      <div>
        <button onClick={() => handleHideAll()}>
          {Object.keys(get).filter((key) => key !== "sessions").every((exercise) =>
            varFilter[exercise].includes("HIDE")
          )
            ? "Show"
            : "Hide"}{" "}
          All Exercises
        </button>
        {Object.keys(get)
          .filter((key) => key !== "sessions")
          .map((exercise) => (
            <div key={`${exercise}VarFilter`} style={{ display: "block" }}>
              <button
                onClick={() => {
                  if (varFilter[exercise].includes("HIDE")) {
                    setVarFilter({
                      ...varFilter,
                      [exercise]: [],
                    });
                    if (varMenus[exercise])
                      setVarMenus({ ...varMenus, [exercise]: false });
                  } else {
                    setVarFilter({
                      ...varFilter,
                      [exercise]: ["HIDE"],
                    });
                  }
                }}
              >
                {varFilter[exercise].includes("HIDE") ? "Show" : "Hide"}&nbsp;
                {exercise
                  .split("_")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
              {!varFilter[exercise].includes("HIDE") && (
                <>
                  <button
                    onClick={() => {
                      if (!varMenus[exercise])
                        setVarMenus({
                          ...varMenus,
                          [exercise]: !varMenus[exercise],
                        });
                      else if (
                        varMenus[exercise] &&
                        !varFilter[exercise].length
                      )
                        setVarMenus({
                          ...varMenus,
                          [exercise]: !varMenus[exercise],
                        });
                      else {
                        setVarFilter({ ...varFilter, [exercise]: [] });
                        Object.keys(checkRefs.current[exercise]).forEach(
                          (vari) =>
                            (checkRefs.current[exercise][vari].checked = false)
                        );
                      }
                    }}
                  >
                    {varFilter[exercise].length > 0
                      ? "Show All"
                      : varMenus[exercise]
                      ? "Filter <"
                      : "Filter >"}
                  </button>

                  {varMenus[exercise] &&
                    variationObject[exercise].flat().map((value) => {
                      return (
                        <label key={`${exercise}_${value}_box`}>
                          {value}
                          <input
                            ref={(el) =>
                              (checkRefs.current = {
                                ...checkRefs.current,
                                [exercise]: {
                                  ...checkRefs.current[exercise],
                                  [value]: el,
                                },
                              })
                            }
                            type="checkbox"
                            onChange={(e) =>
                              e.target.checked
                                ? setVarFilter({
                                    ...varFilter,
                                    [exercise]: [...varFilter[exercise], value],
                                  })
                                : setVarFilter({
                                    ...varFilter,
                                    [exercise]: varFilter[exercise].filter(
                                      (variation) => variation !== value
                                    ),
                                  })
                            }
                          />
                        </label>
                      );
                    })}
                </>
              )}
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
    else if (page === PROFILE) return <Profile user={user} />;
  }

  if (get === null)
    return (
      <>
        <strong>Loading...</strong>
        <Spinner />
      </>
    );

  return (
    <div>
      <h1>Lifting Log</h1>
      {loading && <Spinner />}
      {pageButtons()}
      <Logout />
      {returnComponent()}
    </div>
  );
}
