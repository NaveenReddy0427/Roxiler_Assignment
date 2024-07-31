import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js'; // Import the connectDB function
import productRoutes from './routes/productRoutes.js'; // Import your product routes
import cors from "cors";


// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());


// Routes
app.use('/api', productRoutes);

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
