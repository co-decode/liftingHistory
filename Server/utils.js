const log = (statement) => console.log(statement)

const lifts =  {deadlift: {mass: [155, 160, 167.5, 160], reps: [1,1,1,1], variation: ["Conventional", "Mixed"]},
bench: {mass: [80, 85, 90, 95, 90, 90], reps: [5,3,1,1,1,1], variation: ["Wide Grip", "Flat"]},
squat: {mass: [130, 137.5, 142.5, 137.5, 130, 120], reps: [3, 1, 1, 1, 3, 5], variation: ["High Bar"]}}

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
        lifts[exerciseArray[i]].mass.toString()
        output = output.concat(`INSERT INTO ${exerciseArray[i]} (uid, sid, mass, reps, variation) VALUES (${id}, ${sid}, '{${lifts[exerciseArray[i]].mass}}', '{${lifts[exerciseArray[i]].reps}}', '{${lifts[exerciseArray[i]].variation}}');`)
    }
    return output
}
// console.log(createInsertFromObject(3, 45, lifts))


function createUpdateFromObject(sid, lifts) {
    const exerciseArray = Object.keys(lifts)
    let output = ``;
    for (let i = 0; i < exerciseArray.length; i++) {
        output = output.concat(`UPDATE ${exerciseArray[i]} SET mass = '{${lifts[exerciseArray[i]].mass}}', reps = '{${lifts[exerciseArray[i]].reps}}', variation = '{${lifts[exerciseArray[i]].variation}}' WHERE sid = ${sid};`)
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

module.exports = {createExercisesFromBody, createInsertFromObject, createUpdateFromObject, createDeleteFromArray, createGetFromExercises}