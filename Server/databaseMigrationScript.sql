bench
deadlift
squat
overhead_press
bicep
tricep
grip
lunge
calf
row
shrug
pull_up
push_up
dip
abs
lateral_raise
good_morning
face_pull
hip_thrust
hip_abduction
adductors
reverse_flies
rotator_cuff
pull_over
neck
nordic
reverse_nordic
leg_curl
flies
back_extension
alter table bench rename variation to variation_templates;
alter table deadlift rename variation to variation_templates;
alter table squat rename variation to variation_templates;
alter table overhead_press rename variation to variation_templates;
alter table bicep rename variation to variation_templates;
alter table tricep rename variation to variation_templates;
alter table grip rename variation to variation_templates;
alter table lunge rename variation to variation_templates;
alter table calf rename variation to variation_templates;
alter table row rename variation to variation_templates;
alter table shrug rename variation to variation_templates;
alter table pull_up rename variation to variation_templates;
alter table push_up rename variation to variation_templates;
alter table dip rename variation to variation_templates;
alter table abs rename variation to variation_templates;
alter table lateral_raise rename variation to variation_templates;
alter table good_morning rename variation to variation_templates;
alter table face_pull rename variation to variation_templates;
alter table hip_thrust rename variation to variation_templates;
alter table hip_abduction rename variation to variation_templates;
alter table adductors rename variation to variation_templates;
alter table reverse_flies rename variation to variation_templates;
alter table rotator_cuff rename variation to variation_templates;
alter table pull_over rename variation to variation_templates;
alter table neck rename variation to variation_templates;
alter table nordic rename variation to variation_templates;
alter table reverse_nordic rename variation to variation_templates;
alter table leg_curl rename variation to variation_templates;
alter table flies rename variation to variation_templates;
alter table back_extension rename variation to variation_templates;
alter table bench add vars integer[];
alter table deadlift add vars integer[];
alter table squat add vars integer[];
alter table overhead_press add vars integer[];
alter table bicep add vars integer[];
alter table tricep add vars integer[];
alter table grip add vars integer[];
alter table lunge add vars integer[];
alter table calf add vars integer[];
alter table row add vars integer[];
alter table shrug add vars integer[];
alter table pull_up add vars integer[];
alter table push_up add vars integer[];
alter table dip add vars integer[];
alter table abs add vars integer[];
alter table lateral_raise add vars integer[];
alter table good_morning add vars integer[];
alter table face_pull add vars integer[];
alter table hip_thrust add vars integer[];
alter table hip_abduction add vars integer[];
alter table adductors add vars integer[];
alter table reverse_flies add vars integer[];
alter table rotator_cuff add vars integer[];
alter table pull_over add vars integer[];
alter table neck add vars integer[];
alter table nordic add vars integer[];
alter table reverse_nordic add vars integer[];
alter table leg_curl add vars integer[];
alter table flies add vars integer[];
alter table back_extension add vars integer[];
update bench set variation_templates = ARRAY[variation_templates];
update deadlift set variation_templates = ARRAY[variation_templates];
update squat set variation_templates = ARRAY[variation_templates];
update overhead_press set variation_templates = ARRAY[variation_templates];
update bicep set variation_templates = ARRAY[variation_templates];
update tricep set variation_templates = ARRAY[variation_templates];
update grip set variation_templates = ARRAY[variation_templates];
update lunge set variation_templates = ARRAY[variation_templates];
update calf set variation_templates = ARRAY[variation_templates];
update row set variation_templates = ARRAY[variation_templates];
update shrug set variation_templates = ARRAY[variation_templates];
update pull_up set variation_templates = ARRAY[variation_templates];
update push_up set variation_templates = ARRAY[variation_templates];
update dip set variation_templates = ARRAY[variation_templates];
update abs set variation_templates = ARRAY[variation_templates];
update lateral_raise set variation_templates = ARRAY[variation_templates];
update good_morning set variation_templates = ARRAY[variation_templates];
update face_pull set variation_templates = ARRAY[variation_templates];
update hip_thrust set variation_templates = ARRAY[variation_templates];
update hip_abduction set variation_templates = ARRAY[variation_templates];
update adductors set variation_templates = ARRAY[variation_templates];
update reverse_flies set variation_templates = ARRAY[variation_templates];
update rotator_cuff set variation_templates = ARRAY[variation_templates];
update pull_over set variation_templates = ARRAY[variation_templates];
update neck set variation_templates = ARRAY[variation_templates];
update nordic set variation_templates = ARRAY[variation_templates];
update reverse_nordic set variation_templates = ARRAY[variation_templates];
update leg_curl set variation_templates = ARRAY[variation_templates];
update flies set variation_templates = ARRAY[variation_templates];
update back_extension set variation_templates = ARRAY[variation_templates];