/* This file contains the Dynamic SQL functions for the database */
/* READ */

/* Get all exercises for a session relationally */
DROP FUNCTION get_session_exercises(integer);

CREATE OR REPLACE FUNCTION get_session_exercises(session_id integer)
RETURNS TABLE (
    exercise_name text, 
    reps integer[],
    mass numeric(6,2)[],
    variation_templates varchar(64)[],
    vars integer[]
    )
AS $$
DECLARE
  final_query text;
BEGIN
  final_query := '
   SELECT * FROM ( ';
  
  FOR exercise_name IN
      SELECT unnest(exercises) AS exercise_name
      FROM sessions
      WHERE sid = session_id
  LOOP
    final_query := final_query || 'SELECT 
    ''' || quote_ident(exercise_name) || ''' AS exercise_name, 
    reps, mass, variation_templates, vars 
    FROM ' || quote_ident(exercise_name) || 
    ' WHERE ' || quote_ident(exercise_name) || '.sid = ' || session_id || '
    UNION ALL ';
  END LOOP;

  final_query := left(final_query, -11) || ') AS all_ids
  ORDER BY exercise_name ASC;';

  RETURN QUERY EXECUTE final_query;
END;
$$ LANGUAGE plpgsql;

/* Get all sessions for a user relationally */
DROP FUNCTION get_user_sessions(integer);

CREATE OR REPLACE FUNCTION get_user_sessions(user_id integer)
RETURNS TABLE (
    sid integer,
    date timestamp with time zone,
    exercises varchar(255)[],
    exercise_name text,
    reps integer[],
    mass numeric(6,2)[],
    variation_templates varchar(64)[],
    vars integer[]
    )
AS $$
DECLARE
  final_query text;
BEGIN
  final_query := '
   SELECT * FROM ( ';
  
  FOR sid IN
      SELECT s.sid
      FROM sessions s
      WHERE s.uid = user_id
  LOOP
    final_query := final_query || 
    'SELECT ' || sid || ' AS sid, CAST(NULL AS timestamp with time zone) AS date, 
    CAST(NULL AS varchar(255)[]) AS exercises, exercise_name, reps, mass, 
    variation_templates, vars FROM get_session_exercises( ' || sid || ' ) 
    UNION ALL ';
  END LOOP;

  final_query := left(final_query, -11) || ') AS all_sessions 
  UNION ALL select sid, date, exercises, NULL AS exercise_name, NULL AS reps,
  NULL as mass, NULL AS variation_templates, NULL AS vars FROM sessions 
  WHERE uid = ' || user_id || ' ;';

  RETURN QUERY EXECUTE final_query;
END;
$$ LANGUAGE plpgsql;

