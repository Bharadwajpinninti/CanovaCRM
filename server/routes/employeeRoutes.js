import express from 'express';
import { login } from '../controllers/employeeController.js';

const employeeRouter = express.Router();

employeeRouter.post('/login', login);

export default employeeRouter;

