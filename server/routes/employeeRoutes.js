import express from 'express';
import { login,updateProfileName,updateEmployeeStatus } from '../controllers/employeeController.js';

const employeeRouter = express.Router();

employeeRouter.post('/login', login);
employeeRouter.put('/update-profile/:id', updateProfileName);
employeeRouter.put('/:id/status', updateEmployeeStatus);

export default employeeRouter;

