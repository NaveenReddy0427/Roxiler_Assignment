import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const Statistics = () => {
  const [statistics, setStatistics] = useState({});
  const [month, setMonth] = useState(3); // Default month March

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = async () => {
    try {
      const { data } = await axios.get('/api/statistics', { params: { month } });
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div>
      <Select
        options={months}
        value={months.find(monthOption => monthOption.value === month)}
        onChange={selectedOption => setMonth(selectedOption.value)}
        placeholder="Select Month"
      />
      <div>
        <h3>Statistics for {months.find(monthOption => monthOption.value === month)?.label}</h3>
        <p>Total Sales: ${statistics.totalSales || 0}</p>
        <p>Total Sold Items: {statistics.totalSold || 0}</p>
        <p>Total Not Sold Items: {statistics.totalNotSold || 0}</p>
      </div>
    </div>
  );
};

export default Statistics;
