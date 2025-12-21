import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import leadRouter from './routes/leadRoutes.js';

// App Config
const app = express();
const port = process.env.PORT || 5000;
connectDB();

// Middlewares
app.use(express.json());
app.use(cors()); // Allows frontend to connect to backend

// API Endpoints
app.use('/api/admin', adminRouter);       // Admin Login, Create Employee, Upload CSV
app.use('/api/employee', employeeRouter); // Employee Login, Check-in/out, Get Leads
app.use('/api/leads', leadRouter);        // Lead Status Update, Scheduling

app.get('/', (req, res) => {
    res.send('API WORKING - SALES CRM');
});

app.listen(port, () => {
    console.log(`Server started on PORT ${port}`);
});