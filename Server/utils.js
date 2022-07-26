
// '{"deadlift", "squat"}'

// exercisesArray = ["deadlift", "squat"];

const lifts = {deadlift: {mass: 160, reps: 1, sets: 4, scheme: "pyramid", variation: "standard"},
        squat: {mass: 150, reps: 1, sets: 4, scheme: "pyramid", variation: "standard"}}

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

//`INSERT INTO deadlift (uid, sid, mass, reps, sets, scheme, variation) VALUES (${id}, ${sid}, 6, 6, 6, 'yo', 'mama')`

function createInsertFromObject(id, sid, lifts) {
    const exerciseArray = Object.keys(lifts)
    let output = ``;
    for (let i = 0; i < exerciseArray.length; i++) {
        output = output.concat(`INSERT INTO ${exerciseArray[i]} (uid, sid, mass, reps, sets, scheme, variation) VALUES (${id}, ${sid}, ${lifts[exerciseArray[i]].mass}, ${lifts[exerciseArray[i]].reps}, ${lifts[exerciseArray[i]].sets}, '${lifts[exerciseArray[i]].scheme}', '${lifts[exerciseArray[i]].variation}');`)
    }
    return output
}

function createUpdateFromObject(sid, lifts) {
    const exerciseArray = Object.keys(lifts)
    let output = ``;
    for (let i = 0; i < exerciseArray.length; i++) {
        output = output.concat(`UPDATE ${exerciseArray[i]} SET mass = ${lifts[exerciseArray[i]].mass}, reps = ${lifts[exerciseArray[i]].reps}, sets = ${lifts[exerciseArray[i]].sets}, scheme = '${lifts[exerciseArray[i]].scheme}', variation = '${lifts[exerciseArray[i]].variation}' WHERE sid = ${sid};`)
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


// Update an existing session // completely remakes the object for now
// app.put('/sessions/:sid', (req,res,next) => {
//     const sid = req.params.sid;
//     const lifts = req.body.lifts;
//     userPool.query(`UPDATE deadlift`)
// })

// console.log(new Date(Date.now()).toISOString());




module.exports = {createExercisesFromBody, createInsertFromObject, createUpdateFromObject, createDeleteFromArray}