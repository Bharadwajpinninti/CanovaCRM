import express from 'express';
import { login,updateProfileName,updateEmployeeStatus } from '../controllers/employeeController.js';
import { getDashboardStatus,toggleAttendance,toggleBreak } from '../controllers/attendanceController.js';

const employeeRouter = express.Router();

employeeRouter.post('/login', login);
employeeRouter.put('/update-profile/:id', updateProfileName);
employeeRouter.get('/dashboard-status/:id', getDashboardStatus);
employeeRouter.put('/:id/status', toggleAttendance);
employeeRouter.put('/:id/break', toggleBreak);

export default employeeRouter;

