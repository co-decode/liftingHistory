-- FOR EVERY NEW EXERCISE: Duplicate - 1. the Table - 2. the Unique Constraint - 3. the FK Constraints
    -- Search "VVVVVVVVVVVVV  " to jump to each place of interest

-- VVVVVVVVVVVVV  TABLES, duplicate for every Exercise Table VVVVVVVVVVVVVVVVVVVVVVVVVV
--
-- Name: bench; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bench (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);



--
-- Name: deadlift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deadlift (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);



--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid integer NOT NULL,
    date timestamp without time zone NOT NULL,
    exercises character varying(255)[] NOT NULL,
    uid integer NOT NULL
);



--
-- Name: sessions_sid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_sid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: sessions_sid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_sid_seq OWNED BY public.sessions.sid;


--
-- Name: squat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.squat (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);



--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);



--
-- Name: users_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_uid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_uid_seq OWNED BY public.users.uid;


--
-- Name: sessions sid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN sid SET DEFAULT nextval('public.sessions_sid_seq'::regclass);


--
-- Name: users uid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN uid SET DEFAULT nextval('public.users_uid_seq'::regclass);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);

-- VVVVVVVVVVVVV  UNIQUE Constraints, duplicate for every Exercise Table VVVVVVVVVVVVVVVVVVVVVVVVVV
--
-- Name: bench sid_ukey_bench; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bench
    ADD CONSTRAINT sid_ukey_bench UNIQUE (sid);


--
-- Name: deadlift sid_ukey_deadlift; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deadlift
    ADD CONSTRAINT sid_ukey_deadlift UNIQUE (sid);


--
-- Name: squat sid_ukey_squat; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.squat
    ADD CONSTRAINT sid_ukey_squat UNIQUE (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


-- VVVVVVVVVVVVV  FK Constraint SID, duplicate for every Exercise Table VVVVVVVVVVVVVVVVVVVVVVVVVV

--
-- Name: deadlift fk_sid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deadlift
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);


--
-- Name: squat fk_sid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.squat
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);


--
-- Name: bench fk_sid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bench
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);


--
-- Name: deadlift fk_uid; Type: FK CONSTRAINT; Schema: public; Owner: postgres

-- VVVVVVVVVVVVV  FK Constraint: UID, duplicate for every Exercise Table VVVVVVVVVVVVVVVVVVVVVVVVVV
--

ALTER TABLE ONLY public.deadlift
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: squat fk_uid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.squat
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: bench fk_uid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bench
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);


--
-- Name: sessions fk_uid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);



-- NEW STUFF:
-- overhead_press
-- bicep
-- tricep
-- grip
-- lunge
-- calf
-- row
-- shrug
-- pull_up
-- push_up
-- dip
-- abs
-- lateral_raise
-- good_morning
-- face_pull
-- hip_thrust
-- hip_abduction
-- hip_adduction
-- reverse_flies
-- rotator_cuff
-- pull_over
-- neck
-- nordic
-- reverse_nordic
-- leg_curl
-- flies
-- back_extension

-- NEW TABLES

CREATE TABLE public.overhead_press (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.bicep (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.tricep (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.grip (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.lunge (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.calf (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.row (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.shrug (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.pull_up (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.push_up (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.dip (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.abs (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.lateral_raise (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.good_morning (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.face_pull (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.hip_thrust (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.hip_abduction (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.hip_adduction (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.reverse_flies (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.rotator_cuff (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.pull_over (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.neck (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.nordic (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.reverse_nordic (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.leg_curl (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.flies (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);
CREATE TABLE public.back_extension (
    uid integer,
    sid integer,
    mass numeric(6,2)[] NOT NULL,
    reps integer[] NOT NULL,
    variation character varying(64)[] NOT NULL
);

-- NEW UNIQUE

ALTER TABLE ONLY public.overhead_press
    ADD CONSTRAINT sid_ukey_overhead_press UNIQUE (sid);
ALTER TABLE ONLY public.bicep
    ADD CONSTRAINT sid_ukey_bicep UNIQUE (sid);
ALTER TABLE ONLY public.tricep
    ADD CONSTRAINT sid_ukey_tricep UNIQUE (sid);
ALTER TABLE ONLY public.grip
    ADD CONSTRAINT sid_ukey_grip UNIQUE (sid);
ALTER TABLE ONLY public.lunge
    ADD CONSTRAINT sid_ukey_lunge UNIQUE (sid);
ALTER TABLE ONLY public.calf
    ADD CONSTRAINT sid_ukey_calf UNIQUE (sid);
ALTER TABLE ONLY public.row
    ADD CONSTRAINT sid_ukey_row UNIQUE (sid);
ALTER TABLE ONLY public.shrug
    ADD CONSTRAINT sid_ukey_shrug UNIQUE (sid);
ALTER TABLE ONLY public.pull_up
    ADD CONSTRAINT sid_ukey_pull_up UNIQUE (sid);
ALTER TABLE ONLY public.push_up
    ADD CONSTRAINT sid_ukey_push_up UNIQUE (sid);
ALTER TABLE ONLY public.dip
    ADD CONSTRAINT sid_ukey_dip UNIQUE (sid);
ALTER TABLE ONLY public.abs
    ADD CONSTRAINT sid_ukey_abs UNIQUE (sid);
ALTER TABLE ONLY public.lateral_raise
    ADD CONSTRAINT sid_ukey_lateral_raise UNIQUE (sid);
ALTER TABLE ONLY public.good_morning
    ADD CONSTRAINT sid_ukey_good_morning UNIQUE (sid);
ALTER TABLE ONLY public.face_pull
    ADD CONSTRAINT sid_ukey_face_pull UNIQUE (sid);
ALTER TABLE ONLY public.hip_thrust
    ADD CONSTRAINT sid_ukey_hip_thrust UNIQUE (sid);
ALTER TABLE ONLY public.hip_abduction
    ADD CONSTRAINT sid_ukey_hip_abduction UNIQUE (sid);
ALTER TABLE ONLY public.hip_adduction
    ADD CONSTRAINT sid_ukey_hip_adduction UNIQUE (sid);
ALTER TABLE ONLY public.reverse_flies
    ADD CONSTRAINT sid_ukey_reverse_flies UNIQUE (sid);
ALTER TABLE ONLY public.rotator_cuff
    ADD CONSTRAINT sid_ukey_rotator_cuff UNIQUE (sid);
ALTER TABLE ONLY public.pull_over
    ADD CONSTRAINT sid_ukey_pull_over UNIQUE (sid);
ALTER TABLE ONLY public.neck
    ADD CONSTRAINT sid_ukey_neck UNIQUE (sid);
ALTER TABLE ONLY public.nordic
    ADD CONSTRAINT sid_ukey_nordic UNIQUE (sid);
ALTER TABLE ONLY public.reverse_nordic
    ADD CONSTRAINT sid_ukey_reverse_nordic UNIQUE (sid);
ALTER TABLE ONLY public.leg_curl
    ADD CONSTRAINT sid_ukey_leg_curl UNIQUE (sid);
ALTER TABLE ONLY public.flies
    ADD CONSTRAINT sid_ukey_flies UNIQUE (sid);
ALTER TABLE ONLY public.back_extension
    ADD CONSTRAINT sid_ukey_back_extension UNIQUE (sid);

-- NEW FK SID

ALTER TABLE ONLY public.overhead_press
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.bicep
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.tricep
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.grip
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.lunge
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.calf
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.row
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.shrug
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.pull_up
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.push_up
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.dip
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.abs
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.lateral_raise
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.good_morning
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.face_pull
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.hip_thrust
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.hip_abduction
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.hip_adduction
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.reverse_flies
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.rotator_cuff
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.pull_over
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.neck
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.nordic
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.reverse_nordic
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.leg_curl
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.flies
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);
ALTER TABLE ONLY public.back_extension
    ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.sessions(sid);


-- NEW FK UID

ALTER TABLE ONLY public.overhead_press
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.bicep
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.tricep
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.grip
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.lunge
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.calf
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.row
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.shrug
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.pull_up
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.push_up
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.dip
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.abs
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.lateral_raise
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.good_morning
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.face_pull
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.hip_thrust
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.hip_abduction
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.hip_adduction
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.reverse_flies
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.rotator_cuff
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.pull_over
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.neck
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.nordic
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.reverse_nordic
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.leg_curl
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.flies
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);
ALTER TABLE ONLY public.back_extension
    ADD CONSTRAINT fk_uid FOREIGN KEY (uid) REFERENCES public.users(uid);