const log = (statement) => console.log(statement)

const lifts =  {deadlift: {mass: [155, 160, 167.5, 160], reps: [1,1,1,1], vars: [0,0,1,0], variation_templates: [["Conventional", "Mixed"],["UnderWater"]]}}
/* ,
bench: {mass: [80, 85, 90, 95, 90, 90], reps: [5,3,1,1,1,1], variation: ["Wide Grip", "Flat"]},
squat: {mass: [130, 137.5, 142.5, 137.5, 130, 120], reps: [3, 1, 1, 1, 3, 5], variation: ["High Bar"]}} */

function createExercisesFromBody(lifts) {
    let keys = Object.keys(lifts);
    let length = keys.length
    if (length === 0) {return null}
    let output = `'{`
    for (i = 0; i < length; i++) {
        output = output.concat(`"${keys[i]}"`)
        if (i < length - 1) {
            output = output.concat(`, `)
        }
    }
    output = output.concat(`}'`);
    return output;
}
// console.log(Object.keys(lifts))
// console.log(createExercisesFromBody(lifts))


function createInsertFromObject(id, sid, lifts) {
    const exerciseArray = Object.keys(lifts)
    let output = ``;
    for (let i = 0; i < exerciseArray.length; i++) {
        const longestTemplateLength = Math.max(...lifts[exerciseArray[i]].variation_templates.map(template=> template.length))
        const variation_templates_string = lifts[exerciseArray[i]].variation_templates.map(template => {
            const toBeAdded = longestTemplateLength - template.length
            // console.log(toBeAdded, longestTemplateLength)
            return toBeAdded ? template.concat(Array(toBeAdded).fill('null')) : template
        }).reduce((acc, template, tempNo, templates) => 
                tempNo === templates.length - 1 
                ? acc + `{${template}}` 
                : acc + `{${template}},`, ``)
        // lifts[exerciseArray[i]].mass.toString()
        output = output.concat(`INSERT INTO ${exerciseArray[i]} (uid, sid, mass, reps, variation_templates, vars) VALUES (${id}, ${sid}, '{${lifts[exerciseArray[i]].mass}}', '{${lifts[exerciseArray[i]].reps}}', '{${variation_templates_string.replace("'", "''")}}', '{${lifts[exerciseArray[i]].vars}}');`)
    }
    return output
}
// console.log(createInsertFromObject(3, 45, lifts))


function createUpdateFromObject(sid, lifts) {
    const exerciseArray = Object.keys(lifts)
    let output = ``;
    for (let i = 0; i < exerciseArray.length; i++) {
        const longestTemplateLength = Math.max(...lifts[exerciseArray[i]].variation_templates.map(template=> template.length))
        const variation_templates_string = lifts[exerciseArray[i]].variation_templates.map(template => {
            const toBeAdded = longestTemplateLength - template.length
            // console.log(toBeAdded, longestTemplateLength)
            return toBeAdded ? template.concat(Array(toBeAdded).fill('null')) : template
        }).reduce((acc, template, tempNo, templates) => 
                tempNo === templates.length - 1 
                ? acc + `{${template}}` 
                : acc + `{${template}},`, ``)
        output = output.concat(`UPDATE ${exerciseArray[i]} SET mass = '{${lifts[exerciseArray[i]].mass}}', reps = '{${lifts[exerciseArray[i]].reps}}', variation_templates = '{${variation_templates_string}}', vars = '{${lifts[exerciseArray[i]].vars}}' WHERE sid = ${sid};`)
    }
    return output;
}

function createDeleteFromArray(sid, lostLifts) {
    let output=``;
    for (let i = 0; i < lostLifts.length; i++) {
        output = output.concat(`DELETE FROM ${lostLifts[i]} WHERE sid = ${sid};`)
    }
    return output
}

// console.log(createUpdateFromObject(18, lifts))

// console.log(createInsertFromObject(1,2,lifts));

// console.log(createDeleteFromArray(19, ["deadlift", "squat"]))

function createGetFromExercises(arrayFromSet, uid) {
    let output = `select`
    arrayFromSet.forEach((v, i, a) => i === a.length - 1 
        ? output += (` json_agg(distinct ${v}) ${v}`) 
        : output += (` json_agg(distinct ${v}) ${v},`))
    arrayFromSet.forEach((v,i,a) => i === 0
        ? output += (` FROM ${v}`)
        : output += (` FULL JOIN ${v} USING (uid)`))
    output += (` WHERE uid = ${uid};`)
    return output
}   
// log(createGetFromExercises(['bench', 'deadlift'], 3))

// function createGet(uid, everySingleExercise = [
//     "deadlift", 
//     "squat", 
//     "bench",
//     "overhead_press",
//     "bicep",
//     "tricep",
//     "grip",
//     "lunge",
//     "calf",
//     "row",
//     "shrug",
//     "pull_up",
//     "push_up",
//     "dip",
//     "abs",
//     "lateral_raise",
//     "good_morning",
//     "face_pull",
//     "hip_thrust",
//     "hip_abduction",
//     "adductors",
//     "reverse_flies",
//     "rotator_cuff",
//     "pull_over",
//     "neck",
//     "nordic",
//     "reverse_nordic",
//     "leg_curl",
//     "flies",
//     "back_extension"
// ]) {
//     let output = `select jsonb_object_nullif(jsonb_build_object('session',jsonb_build_object('sid', sessions.sid, 'date', sessions.date, 'exercises', sessions.exercises)`
//     everySingleExercise.forEach(exercise => {
//         output = output.concat(`, '${exercise}', jsonb_object_nullif(jsonb_build_object('mass', ${exercise}.mass, 'reps', ${exercise}.reps, 'vars', ${exercise}.vars, 'variation_templates', ${exercise}.variation_templates))`)
//     })
//     output = output.concat(`)) as sessions from sessions`)
//     everySingleExercise.forEach(exercise => {
//         output = output.concat(` FULL JOIN ${exercise} ON ${exercise}.sid = sessions.sid`)
//     })
//     output = output.concat(` WHERE sessions.uid = ${uid};`)
//     console.log(output)
//     return output
// }

function createGet(uid, exerciseArray = [
        "deadlift", 
        "squat", 
        "bench",
        "overhead_press",
        "bicep",
        "tricep",
        "grip",
        "lunge",
        "calf",
        "row",
        "shrug",
        "pull_up",
        "push_up",
        "dip",
        "abs",
        "lateral_raise",
        "good_morning",
        "face_pull",
        "hip_thrust",
        "hip_abduction",
        "adductors",
        "reverse_flies",
        "rotator_cuff",
        "pull_over",
        "neck",
        "nordic",
        "reverse_nordic",
        "leg_curl",
        "flies",
        "back_extension"
    ]) {
    let output = `SELECT jsonb_agg(jsonb_build_object('sid', sid,'date', date, 'exercises', exercises)) sessions`
    exerciseArray.forEach((exercise, index, arr) => {
        output = output.concat(`, (select jsonb_agg(jsonb_build_object('sid', sid, 'mass', mass, 'reps', reps, 'vars', vars, 'variation_templates', variation_templates)) from ${exercise}) ${exercise}`)
    })
    output = output.concat(` FROM sessions where uid = ${uid};`)
    return output
}
// log(createGet(3))

"SELECT jsonb_build_object('sessions', jsonb_agg(jsonb_build_object('sid', sid,'date', date, 'exercises', exercises))) from sessions;"

//This will work vvv

String.raw`SELECT jsonb_build_object('sessions', jsonb_agg(jsonb_build_object('sid', sid,'date', date, 'exercises', exercises))) sessions, (select jsonb_build_object('bench', jsonb_agg(jsonb_build_object('mass', mass, 'reps', reps, 'vars', vars, 'variation_templates', variation_templates))) from bench) from sessions;`

String.raw`SELECT jsonb_agg(jsonb_build_object('sid', sid,'date', date, 'exercises', exercises)) sessions, (select jsonb_agg(jsonb_build_object('sid', sid, 'mass', mass, 'reps', reps, 'vars', vars, 'variation_templates', variation_templates)) bench from bench) from sessions;`

String.raw`select array_agg(distinct u.val) from sessions cross join lateral unnest(sessions.exercises) as u(val);`

function deleteSessionQuery(sid, exerciseArray) {
    let output = ``
    exerciseArray.forEach(exer=> output += `delete from ${exer} where sid = ${sid};`)
    output += `delete from sessions where sid = ${sid};`
    return output
}

module.exports = {createExercisesFromBody, createInsertFromObject, createUpdateFromObject, createDeleteFromArray, createGetFromExercises, deleteSessionQuery, createGet}


// POSTGRES HELPER FUNCTION: 
 /* 
 
    create or replace function jsonb_object_nullif(
        _data jsonb
    )
    returns jsonb
    as $$
        select nullif(jsonb_strip_nulls(_data)::text, '{}')::jsonb
    $$ language sql;


 */
