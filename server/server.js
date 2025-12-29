import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import connectDB from './config/db.js';
import seedAdmin from './seed/adminSeed.js';
import leadRouter from './routes/leadRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import dashboardRoutes from './routes/dashboard.js'
import Employee from './models/Employee.js';
import cron from 'node-cron';


// App Config
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Start server properly
const startServer = async () => {
    await connectDB();     // DB connect
    await seedAdmin();     // ✅ seed admin ONCE

cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🕛 Midnight Reset: Setting all employees to Inactive');
    await Employee.updateMany({}, { status: 'Inactive' });
  } catch (error) {
    console.error('Error in midnight reset:', error);
  }
});

    app.listen(port, () => {
        console.log(`Server started on PORT ${port}`);
    });
};

startServer();

// API Endpoints
app.use('/api/admin', adminRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/leads', leadRouter);
app.use('/api/dashboard', dashboardRoutes);
app.get('/', (req, res) => {
    res.send('API WORKING - SALES CRM');
});
