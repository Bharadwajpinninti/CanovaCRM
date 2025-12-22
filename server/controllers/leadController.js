import Lead from '../models/Lead.js';
import Employee from '../models/Employee.js';

// --- ADD LEAD MANUALLY (Unchanged - Keeps the Alert logic correct) ---
export const addLeadManual = async (req, res) => {
    try {
        const { name, email, source, date, location, language } = req.body;

        let leadData = {
            name, email, source, date, location, language,
            status: "ongoing",
            type: "-",
            scheduleDate: "-",
            assignedTo: null 
        };

        const matchingEmployees = await Employee.find({ 
            language: language,
            status: "Active"
        });

        let selectedEmployee = null;

        if (matchingEmployees.length > 0) {
            for (const emp of matchingEmployees) {
                if (emp.assigned < 3) {
                    selectedEmployee = emp;
                    break;
                }
            }
        }

        if (selectedEmployee) {
            leadData.assignedTo = selectedEmployee._id;
            selectedEmployee.assigned += 1;
            await selectedEmployee.save();
        }

        const newLead = new Lead(leadData);
        await newLead.save();

        // 🟢 THIS ALERT LOGIC REMAINS "NAME" AS REQUESTED
        res.json({ 
            success: true, 
            message: selectedEmployee 
                ? `Lead assigned to ${selectedEmployee.firstName}` 
                : "Lead saved as Unassigned" 
        });

    } catch (error) {
        console.error("Error adding lead:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE STATUS (Unchanged) ---
export const updateLeadStatus = async (req, res) => {
    try {
        const { leadId, status } = req.body; 
        const lead = await Lead.findById(leadId);
        
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        if (status === "closed" && lead.status !== "closed") {
            if (lead.assignedTo) {
                const employee = await Employee.findById(lead.assignedTo);
                if (employee) {
                    if (employee.assigned > 0) employee.assigned -= 1;
                    employee.closed += 1;
                    await employee.save();
                }
            }
        }

        lead.status = status;
        await lead.save();

        res.json({ success: true, message: "Lead status updated" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL LEADS (Updated) ---
export const getAllLeads = async (req, res) => {
    try {
        // 🟢 UPDATE: Added 'employeeId' to populate list so we can show it in the table
        const leads = await Lead.find()
            .populate('assignedTo', 'firstName lastName employeeId') 
            .sort({ createdAt: -1 });

        res.json({ success: true, leads });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};