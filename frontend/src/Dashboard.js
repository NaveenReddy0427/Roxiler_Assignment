import React from "react";
import TransactionsTable from "./TransactionsTable.js";
import Statistics from "./Statistics.js";
import BarChart from "./BarChart.js";

const Dashboard = ()=>{
  return(
    <>
    <div>
      <h1>Transactions Dashboard</h1>
      <TransactionsTable />
      <Statistics />
      <BarChart />
    </div>
    </>
  )
}

export default Dashboard;