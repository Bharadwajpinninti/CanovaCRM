import express from 'express';
import { addLeadManual, updateLeadStatus,getAllLeads } from '../controllers/leadController.js';

const leadRouter = express.Router();

// Route: POST /api/leads/add
leadRouter.post('/add-manually', addLeadManual);

// Route: PUT /api/leads/update-status
leadRouter.put('/update-status', updateLeadStatus);
leadRouter.get('/all', getAllLeads);

export default leadRouter;