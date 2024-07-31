import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('03'); // Default to March
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await axios.get(`/api/transactions?page=${page}&perPage=${perPage}&search=${search}&month=${month}`);
        setTransactions(transactionsResponse.data);

        // Fetch statistics
        const statisticsResponse = await axios.get(`/api/statistics?month=${month}`);
        setStatistics(statisticsResponse.data);

        // Fetch bar chart data
        const barChartResponse = await axios.get(`/api/bar-chart?month=${month}`);
        setBarChartData(barChartResponse.data);

        // Fetch pie chart data
        const pieChartResponse = await axios.get(`/api/pie-chart?month=${month}`);
        setPieChartData(pieChartResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [search, month, page]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1); // Reset page when month changes
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page when search changes
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Prepare data for charts
  const barChartLabels = barChartData.map(item => item.range);
  const barChartValues = barChartData.map(item => item.count);

  const pieChartLabels = pieChartData.map(item => item.category);
  const pieChartValues = pieChartData.map(item => item.count);

  // Use refs to manage chart instances
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    if (barChartRef.current) {
      barChartRef.current.destroy();
    }
    if (pieChartRef.current) {
      pieChartRef.current.destroy();
    }

    const barCtx = document.getElementById('barChart').getContext('2d');
    barChartRef.current = new ChartJS(barCtx, {
      type: 'bar',
      data: {
        labels: barChartLabels,
        datasets: [{
          label: 'Number of Items',
          data: barChartValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            text: 'Price Range Distribution',
          },
        },
      }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChartRef.current = new ChartJS(pieCtx, {
      type: 'pie',
      data: {
        labels: pieChartLabels,
        datasets: [{
          label: 'Number of Items',
          data: pieChartValues,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (context.parsed > 0) {
                  label += `: ${context.parsed}`;
                }
                return label;
              }
            }
          }
        }
      }
    });
  }, [barChartLabels, barChartValues, pieChartLabels, pieChartValues]);

  return (
    <div className="container">
      <h1>Transactions Dashboard</h1>
      
      <div className="filters">
        <select value={month} onChange={handleMonthChange}>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search transactions"
        />
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction._id}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
          <button onClick={handleNextPage}>Next</button>
        </div>
      </div>
      
      <div className="statistics">
        <h2>Statistics for {month}</h2>
        <p>Total Sales: ${statistics.totalSales}</p>
        <p>Total Sold: {statistics.totalSold} items</p>
        <p>Total Not Sold: {statistics.totalNotSold} items</p>
      </div>
      
      <div className="charts">
        <div className="bar-chart">
          <h2>Price Range Distribution</h2>
          <canvas id="barChart"></canvas>
        </div>
        <div className="pie-chart">
          <h2>Category Distribution</h2>
          <canvas id="pieChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
