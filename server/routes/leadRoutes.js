import express from 'express';
const leadRouter = express.Router();

leadRouter.get('/', (req, res) => res.send('Lead Route Working'));

export default leadRouter;