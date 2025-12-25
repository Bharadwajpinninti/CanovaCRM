import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js'; // Make sure this path matches where you saved the controller

const router = express.Router();

// Route: GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

export default router;