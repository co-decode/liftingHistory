import React from "react";
import Restore from   './subcomponents/RestoreAll';
import FilterCol from './subcomponents/filterCol';
import FilterRow from './subcomponents/filterRowByWeight';

const Filter = ({min, max, reps}) => {

    return(
        <div id="filter">
            <FilterRow min={min} max={max} />
            <FilterCol reps={reps} /> 
            <Restore />
        </div>
    )
}

export default Filter