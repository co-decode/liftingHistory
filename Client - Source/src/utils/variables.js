export const authenticatedKick = '/log'

// export const backend = "http://localhost:3001"
export const backend = "https://liftinghistory-production.up.railway.app"
// "https://lifting-history-2-container.herokuapp.com"
// backend = "https://node-lifting-history2.herokuapp.com"

export const exerciseArray = [
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
]



export const variationObject = {
    deadlift: [
      ["Conventional", "Sumo"],
      ["Double Overhand", "Mixed Grip", "Straps"],
    ],
    squat: [["High Bar", "Front", "Low Bar", "Free"]],
    bench: [
      ["Close Grip", "Standard", "Wide Grip"],
      ["Flat", "Incline"],
    ],
    overhead_press: [["Barbell","Dumbbell"],["Strict", "Push"]],
    bicep: [["Standard","Supinated","Hammer","Reverse"], ["Dumbbell", "Barbell"]],
    tricep: [["Overhead", "Push Down"], ["Dumbbell", "Barbell"]],
    grip: [["Hang", "Hold", "Wrist Curl"]],
    lunge: [["Standard", "Split", "Bulgarian"]],
    calf: [["Dumbbell","Back Loaded", "Front Loaded","Seated"]],
    row: [["Dumbbell", "Barbell","Seal"]],
    shrug: [["Barbell", "Dumbbell"]],
    pull_up: [["Pull Up", "Chin Up", "Neutral"]],
    push_up: [["Standard", "Diamond", "Archer"]],
    dip: [["Bar", "Ring"]],
    abs: [["Knee Raise", "Leg Raise", "Sit Up", "Crunch", ]],
    lateral_raise: [["Dumbbell", "Banded"]],
    good_morning: [["Standing","Seated"]],
    face_pull: [["Banded","Cable"]],
    hip_thrust: [["Thrust", "Bridge"]],
    hip_abduction: [["Banded", "Weighted"]],
    adductors: [["Banded", "Split Hold", "Machine"]],
    reverse_flies: [["T", "Y", "I"]],
    rotator_cuff: [["Dumbbell", "Banded"]],
    pull_over: [["Straight Arm, Elbow"]],
    neck: [["Extension","Flexion", "Side"]],
    nordic: [["Standard","Assisted"]],
    reverse_nordic: [["Full","Wall Assisted"]],
    leg_curl: [["Banded", "Machine"]],
    flies: [["Dumbbell","Cable"]],
    back_extension: [["Diagonal", "Parallel"]]
  };