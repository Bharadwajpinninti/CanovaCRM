import express from 'express';
const employeeRouter = express.Router();

employeeRouter.get('/', (req, res) => res.send('Employee Route Working'));

export default employeeRouter;