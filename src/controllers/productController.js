import axios from 'axios';
import ProductTransaction from '../models/ProductTransaction.js';

// Initialize the database with seed data
export const initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get(process.env.THIRD_PARTY_API_URL);
        await ProductTransaction.insertMany(response.data);
        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// List all transactions with search and pagination
export const listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const searchRegex = new RegExp(search, 'i');
    let query = {};
    
    if (search) {
        if (!isNaN(search)) {
            query = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { price: parseInt(search) }
                ]
            };
        } else {
            query = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            };
        }
    }

    try {
        const transactions = await ProductTransaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get statistics for a specific month
export const getStatistics = async (month) => {
    try {
        const pipeline = [
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, month] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$price" },
                    totalSold: { $sum: { $cond: ["$sold", 1, 0] } },
                    totalNotSold: { $sum: { $cond: ["$sold", 0, 1] } }
                }
            }
        ];
  
        const results = await ProductTransaction.aggregate(pipeline);
        const { totalSales, totalSold, totalNotSold } = results[0] || {};
  
        return {
            totalSales,
            totalSold,
            totalNotSold
        };
    } catch (error) {
        throw new Error('Error fetching statistics: ' + error.message);
    }
};

// Get bar chart data for a specific month
export const getBarChartData = async (month) => {
    try {
        if (isNaN(month) || month < 1 || month > 12) {
            throw new Error('Invalid month');
        }

        const startOfMonth = new Date(`2023-${month}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];

        const data = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
            try {
                const count = await ProductTransaction.countDocuments({
                    dateOfSale: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    },
                    price: { $gte: min, $lte: max }
                });
                return { range, count };
            } catch (error) {
                console.error(`Error calculating count for range ${range}:`, error);
                return { range, count: 0 };
            }
        }));

        return data;
    } catch (error) {
        throw new Error('Error fetching bar chart data: ' + error.message);
    }
};

// Get pie chart data for a specific month
export const getPieChartData = async (month) => {
    const monthMap = new Map([
        ["01", "January"],
        ["02", "February"],
        ["03", "March"],
        ["04", "April"],
        ["05", "May"],
        ["06", "June"],
        ["07", "July"],
        ["08", "August"],
        ["09", "September"],
        ["10", "October"],
        ["11", "November"],
        ["12", "December"]
    ]);

    const monthNumber = String(month).padStart(2, '0');
    if (!monthMap.has(monthNumber)) {
        throw new Error("Invalid or missing month number.");
    }

    const monthName = monthMap.get(monthNumber);

    try {
        const data = await ProductTransaction.find();
        const categoryMap = new Map();

        for (const item of data) {
            const saleDate = new Date(item.dateOfSale);
            const dateMonth = String(saleDate.getMonth() + 1).padStart(2, '0');

            if (dateMonth === monthNumber) {
                const category = item.category;
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, 0);
                }
                categoryMap.set(category, categoryMap.get(category) + 1);
            }
        }

        return {
            month: monthName,
            categories: Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }))
        };
    } catch (error) {
        throw new Error('Error fetching pie chart data: ' + error.message);
    }
};

// Get combined data from all APIs
export const getCombinedData = async (req, res) => {
    const { month } = req.query;

    try {
        if (isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid month number' });
        }

        const [statistics, barChart, pieChart] = await Promise.all([
            getStatistics(month),
            getBarChartData(month),
            getPieChartData(month)
        ]);

        res.status(200).json({
            statistics,
            barChart,
            pieChart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
