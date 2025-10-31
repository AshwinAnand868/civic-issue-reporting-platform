// backend/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db'; // Assuming this function exists and connects Mongoose
import authRoutes from './routes/auth';
import issueRoutes from './routes/issues';
// import departmentRoutes from './routes/departments'; // If you have department routes

// Load environment variables
dotenv.config();

// Connect to Database
connectDB(); 

const app = express();

// --- Middlewares ---
app.use(cors()); // Configure CORS options as needed
app.use(express.json()); // Body parser

// --- Routes ---
app.use("/api/auth", authRoutes);      // Uses the modified login routes
app.use("/api/issues", issueRoutes);    // Uses the issue routes
// app.use("/api/departments", departmentRoutes);

// Simple welcome route
app.get('/', (req, res) => {
  res.send('Civic Issue Reporting API is running.');
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000; // Use your chosen port

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});