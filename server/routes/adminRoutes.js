import express from 'express';
const adminRouter = express.Router();

adminRouter.get('/', (req, res) => res.send('Admin Route Working'));

export default adminRouter;