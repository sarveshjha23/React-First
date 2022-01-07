import React from "react";
import { useState } from "react";

import "./ExpensesFilter.css";

const ExpensesFilter = (props) => {
  const [selected, setSelected] = useState("");

  const selectHandler = (event) => {
    props.expFilter(event.target.value);
  };

  return (
    <div className="expenses-filter">
      <div className="expenses-filter__control">
        <label for="years">Filter by year</label>
        <select id="years" onChange={selectHandler} defaultValue="none">
          <option value="none">All</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
        </select>
      </div>
    </div>
  );
};

export default ExpensesFilter;