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
import { backend } from "./utils/variables";
import Spinner from "./utils/Spinner";

const [PROFILE, LOG, EDIT, TONS, ADD, BREAK, CAL, EQUIV, TABLE, GRAPH] = [
  "PROFILE",
  "LOG",
  "EDIT",
  "TONNAGE",
  "ADD",
  "BREAKDOWN",
  "CALENDAR",
  "EQUIVALENCE",
  "TABLE",
  "GRAPH"
];

export default function Log() {
  const [get, setGet] = useState(null);
  const [edit, setEdit] = useState(0);
  const [page, setPage] = useState(LOG);
  const [tonnagePage, setTonnagePage] = useState(TABLE)
  const [prevEdit, setPrevEdit] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null,
    ascending: null,
  });
  const [user, setUser] = useState(null);

  const [varFilter, setVarFilter] = useState({});
  const [showVarFilter, setShowVarFilter] = useState(false)
  const [varMenus, setVarMenus] = useState({});
  const checkRefs = useRef({});
  const [goToMonthYear, setGoToMonthYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const editRefs = useRef({});
  const log_container_ref = useRef()
  const exercise_filter_ref = useRef()
  const cal_container_ref = useRef()
  const cal_colour_ref = useRef()
  const [windowInfo, setWindowInfo] = useState({scrollPosition: null, screenWidth: null, screenHeight:null})
  const link = useNavigate();

  
  useEffect(() => {
    function scrollListener() {
      const position = window.scrollY
      setWindowInfo({...windowInfo, scrollPosition: position})
    }
    function resizeListener() {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      console.log('resize')
      setWindowInfo({...windowInfo, screenWidth, screenHeight})
    }
    window.addEventListener("scroll", scrollListener, {passive:true})
    window.addEventListener("resize", resizeListener, {passive:true})
    return () =>{ 
      window.removeEventListener("scroll", scrollListener)
      window.removeEventListener("resize", resizeListener)
    }
  },[windowInfo])

  useEffect(() => {
    if(!log_container_ref.current || !exercise_filter_ref.current ) return
    if (showVarFilter){
    log_container_ref.current.classList.add("active_filter")
    exercise_filter_ref.current.classList.add("active_exercise_filter")
  } else {
    log_container_ref.current.classList.remove("active_filter")
    exercise_filter_ref.current.classList.remove("active_exercise_filter")
  }
  }, [showVarFilter])

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

            const sortedDates = res.data.sessions
              .map((v) => new Date(v.date))
              .sort((a, b) => a - b)
            const earliest = new Date(sortedDates[0]);
            const latest = new Date(sortedDates[sortedDates.length - 1]);

            setDateFilter({
              from: new Date(earliest.setTime(earliest.getTime()))
                .toISOString()
                .slice(0, 10),
              to: new Date(
                latest.setTime(latest.getTime() - latest.getTimezoneOffset() * 60 * 1000 + 24 * 60 * 60 * 1000)
              )
                .toISOString()
                .slice(0, 10),
              ascending: JSON.parse(localStorage.getItem("WeightLiftingLogAscending")||"true"),
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
    if (page !== LOG){
      setShowVarFilter(false)
    };
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
        {sidList.map((sidVal, ind, arr) => {
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
            return !varFilter[exercise]
              .some(vari => get[exercise]
                .find(sess => sess.sid === sidVal)
                .variation_templates.flat().includes(vari))
          })) return null

          const baseTimeString = new Date(
            get.sessions.find((v) => v.sid === sidVal).date
          ).toLocaleString()

          return (
            <div
              className="entry_container"
              key={sidVal}
              ref={(element) => {
                editRefs.current = { ...editRefs.current, [sidVal]: element };
              }}
            >
              <div className="top_line">
                {baseTimeString.slice(0,6) + baseTimeString.slice(8,16) + baseTimeString.slice(19)}
                  <button
                    onClick={() => {
                      setEdit(sidVal);
                      setPage(BREAK);

                    }}
                  >
                    View Breakdown
                  </button>
                  <button
                    onClick={() => {
                      setEdit(sidVal);
                      setPage(EDIT);
                    }}
                  >
                    Edit this session
                  </button>
                  <button className="delete" onClick={() => deleteSession(sidVal)}>
                    Delete this session
                  </button>
              </div>
              <div className="exercise_line">
              {exerciseCall.map((v) => {
                const exerciseData = get[v].find((v) => v.sid === sidVal);
                if (varFilter[v].length > 0)
                  if (
                    varFilter[v].every(
                      (vari) => !exerciseData.variation_templates.flat().includes(vari)
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
                      {exerciseData.variation_templates.map((template, ind) => {
                      return <div key={`${sidVal}${v}template${ind}`}>{template.filter(vari=>!!vari).toString().replace(/,/g, ", ")}</div>})}
                    </div>
                  </div>
                );
              })}
              </div>
              {ind < arr.length - 1 && <hr/>}
            </div>
          );
        })}
      </div>
    );
  }
  function pageButtons() {
    const goBack = <div className="center_text h2" onClick={() => setPage(LOG)}><h2>Go Back</h2></div>
    if (page === LOG) {
      return (
        <>
        <div className="center_text h2" tabIndex={1} onClick={() => setPage(ADD)}>
          <h2>{windowInfo.screenWidth < 1200 ? "New Entry" : "Add a New Entry"}</h2>
        </div>
          {get && (
            <>
        <div className="center_text h2" onClick={() => setPage(CAL)}>
          <h2>{windowInfo.screenWidth < 1200 ? "Calendar" : "Go to Calendar"}</h2>
        </div>
        <div className="center_text h2" onClick={() => 
          {setPage(TONS); setTonnagePage(TABLE)}}>
          <h2>{windowInfo.screenWidth < 1200 ? "Tonnage" : "View Tonnage"}</h2>
        </div>
        <div className="center_text h2" onClick={() => 
          { new Promise((resolve) => {setPage(TONS); resolve()}).then(() => setTonnagePage(GRAPH)) }}>
          <h2>{windowInfo.screenWidth < 1200 ? "Graph" : "View Graph"}</h2>
        </div>
            </>
          )}
        <div className="center_text h2" onClick={() => setPage(EQUIV)}>
          <h2>{windowInfo.screenWidth < 1200 ? "Calculator" : "Go to Calculator"}</h2>
        </div>
          {/* <button onClick={() => setPage(PROFILE)}>Change Password</button> */}
        </>
      );
    } else if (page === TONS) {
        return (
        <>
          {goBack}
          <div className="center_text h2" onClick={() => tonnagePage === TABLE ? setTonnagePage(GRAPH) : setTonnagePage(TABLE)}>
            <h2>View {tonnagePage === TABLE ? "Graph" : "Table"}</h2>
          </div>
        </> )
    } else if (page === CAL) {
        return (
          <>
          {goBack}
          <div className="center_text h2" onClick={() => {
            cal_container_ref.current.classList.toggle("calendar_container_active")
            cal_colour_ref.current.classList.toggle("colour_container_active")}}>
            <h2>Colours</h2>
          </div>
          </>
        )
    } else if (page === BREAK) {
        return (
          <>
          {goBack}
          <div className="center_text h2" 
            onClick={() => {
              setPage(EDIT)
            }}>
            <h2>Edit this Session</h2>
          </div>
          </>
        )
    } else if (page === EQUIV) {
        return (
          <>
          {goBack}
          <div className="center_text h2" 
            onClick={() => {
              const options = document.getElementById("options");
              options.style.getPropertyValue("display") === "grid"
                ? options.style.setProperty("display", "none")
                : options.style.setProperty("display", "grid");
            }}>
            <h2>Options</h2>
          </div>
          <div className="center_text h2" 
            onClick={() => {
              const options = document.getElementById("highlightDiv");
              options.style.getPropertyValue("display") === "grid"
                ? options.style.setProperty("display", "none")
                : options.style.setProperty("display", "grid");
            }}>
            <h2>Highlighter</h2>
          </div>
          <div className="center_text h2" 
            onClick={() => {
              const options = document.getElementById("filter");
              options.style.getPropertyValue("display") === "grid"
                ? options.style.setProperty("display", "none")
                : options.style.setProperty("display", "grid");
            }}>
            <h2>Filter</h2>
          </div>
          </>
        )
    } else if (page) {
        return goBack
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
        <label htmlFor="order">Order:</label>
        <select id="order"
          defaultValue={dateFilter.ascending}
          onChange={(e) => {
            console.log(e.target.value, typeof e.target.value)
            // const opposite = !dateFilter.ascending
            setDateFilter({
              ...dateFilter,
              ascending: JSON.parse(e.target.value),
            });
            localStorage.setItem(
              "WeightLiftingLogAscending",
              e.target.value
            );
          }}>
          <option value="false">Newest</option>
          <option value="true">Oldest</option>
        </select>
        <button onClick={() => {
          setShowVarFilter(!showVarFilter)
          // log_container_ref.current.classList.toggle("active_filter")

          // exercise_filter_ref.current.classList.toggle("active_exercise_filter")
        }}>{showVarFilter ? "Close Exercise Filter" : "Open Exercise Filter"}</button>
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
      <div className="filter_set">
        
        <button onClick={()=>{
          setShowVarFilter(!showVarFilter)
          log_container_ref.current.classList.toggle("active_filter")
          exercise_filter_ref.current.classList.toggle("active_exercise_filter")
        }}>Close Exercise Filter</button>
        <button onClick={() => handleHideAll()}>
        {Object.keys(get).filter((key) => key !== "sessions").every((exercise) =>
            varFilter[exercise].includes("HIDE")
          )
            ? "Show"
            : "Hide"}{" "}
          All Exercises
        </button>
        {Object.keys(get)
          .filter((key) => key !== "sessions").sort()
          .map((exercise) => { 
            let variationsForUser = [];
            get[exercise].forEach((sess) =>
              sess.variation_templates.forEach(
                (template) => template.forEach(variation => 
                  variation &&
                  !variationsForUser.includes(variation) &&
                  variationsForUser.push(variation)
              ) )
            );
            return(
            <div key={`${exercise}VarFilter`} style={{ display: "block" }}>
              <div>
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
              </div>
              {!varFilter[exercise].includes("HIDE") && (
                <>
                  <button className="filter"
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
                  </button> <br/>

                  {varMenus[exercise] &&
                  <div className="variation_container">{
                    variationsForUser.map((value) => {
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
                            checked={varFilter[exercise].includes(value)}
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
                  </div>}
                </>
              )}
            </div>
          )})}
      </div>
    );
  }

  function returnComponent() {
    if (page === LOG) {
      return (
        <>
          {get ? 
          (<>
            <div className="log_container" ref={log_container_ref}>
              <div className="filter_bar">
                <h1>Filter</h1>
                  {returnDateFilter()}
              </div>
              <div className="all_entries_container">
                {returnSid()}
              </div>
            </div>
            <div className="exercise_filter" ref={exercise_filter_ref}>
                  {showVarFilter && returnVarFilter()}
            </div>
            {windowInfo.scrollPosition > 50 &&
            <div className="return_to_top" onClick={() =>window.scrollTo({top:0, behavior:"smooth"})}><span>{'\u2191'}</span></div>
            }
          </>) : (
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
          varFilter={varFilter}
          setVarFilter={setVarFilter}
          windowInfo={windowInfo}
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
          windowInfo={windowInfo}
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
          varFilter={varFilter}
          setVarFilter={setVarFilter}
          windowInfo={windowInfo}
        />
      );
    else if (page === TONS) return <Tonnage get={get} tonnagePage={tonnagePage} setTonnagePage={setTonnagePage} />;
    else if (page === CAL)
      return (
        <Calendar
          get={get}
          setPage={setPage}
          setEdit={setEdit}
          goToMonthYear={goToMonthYear}
          cal_container_ref={cal_container_ref}
          cal_colour_ref={cal_colour_ref}
          windowInfo={windowInfo}
        />
      );
    else if (page === EQUIV) return <Equivalence />;
    else if (page === PROFILE) return <Profile user={user} />;
  }

  if (get === null)
    return (
      <>
        <div className="page_container">
        <div className="navbar log">
         <h1>Lifting Log</h1>
         <div className="center_text h2"><h2>Loading</h2></div>
         <div className="center_text h2"><Spinner /></div>
        </div>
      </div>
      </>
    );
  return (
    <div className="page_container">
      <div className="navbar log">
         <h1>Lifting Log</h1>
        {pageButtons()}
        <div className="center_text profile">
          <div className="dropstem">
            <h3>{user.username.length > 6 ? `${user.username}` : `Logged in as ${user.username}`}</h3>
          </div>
          <div className="dropdown">
            <Logout />
            <div className="change_password" 
              onClick={() => setPage(PROFILE)}>
              <span>Change Password</span>
            </div>
          </div>
        </div>
      </div>
      

      {loading && <Spinner />}
      {returnComponent()}
    </div>
  );
}
