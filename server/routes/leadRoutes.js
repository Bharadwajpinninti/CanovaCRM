import express from 'express';
import { addLeadManual, getAllLeads,uploadLeadsCSV,getAssignedLeads,updateLead,getScheduledLeads } from '../controllers/leadController.js';
import { requireCheckIn } from '../middlewares/checkAttendance.js';

const leadRouter = express.Router();

// Route: POST /api/leads/add
leadRouter.post('/add-manually', addLeadManual);

// Route: PUT /api/leads/update-status
// leadRouter.put('/update-status', updateLeadStatus);
leadRouter.get('/all', getAllLeads);
leadRouter.post('/add-csv', uploadLeadsCSV);
leadRouter.get('/assigned/:employeeId',getAssignedLeads);
leadRouter.put('/:id', requireCheckIn, updateLead);
leadRouter.get('/scheduled/:employeeId', getScheduledLeads);

export default leadRouter;