import express from 'express';
// Import the functions we just created
import { addEmployee,
    getAllEmployees ,
    getAdminSettings,
    updateAdminSettings,editEmployee,deleteEmployee } from '../controllers/adminController.js'; 
// Import your existing settings functions if they are in the same file


const adminRouter = express.Router();

// --- SETTINGS (Existing) ---
adminRouter.get('/settings', getAdminSettings);
adminRouter.put('/settings', updateAdminSettings);

// --- EMPLOYEES (New) ---
adminRouter.post('/add-employee', addEmployee); // POST: Add
adminRouter.get('/employees', getAllEmployees); // GET: List
adminRouter.put('/edit-employee', editEmployee);    
adminRouter.delete('/delete-employee', deleteEmployee);

export default adminRouter;