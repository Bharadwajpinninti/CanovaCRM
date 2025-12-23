import Lead from '../models/Lead.js';
import Employee from '../models/Employee.js';
export const addLeadManual = async (req, res) => {
    try {
        const { name, email, source, date, location, language } = req.body;

        // 1. CLEANUP: Only lowercase Language (for matching) and Email (standard)
        // We leave Name, Source, and Location as the user typed them.
        const cleanLanguage = language.toLowerCase();
        const cleanEmail = email.toLowerCase();

        let leadData = {
            name,       // stored as typed (e.g. "John Smith")
            email: cleanEmail,
            source,     // stored as typed
            date,
            location,   // stored as typed
            language: cleanLanguage, // stored as "english"
            
            status: "ongoing",
            type: "-",
            scheduleDate: "-",
            assignedTo: null 
        };

        // 2. MATCHING LOGIC (Case-Insensitive)
        // This ensures "english" matches "English", "ENGLISH", etc.
        const matchingEmployees = await Employee.find({ 
            language: { $regex: new RegExp(`^${cleanLanguage}$`, "i") },
            status: "Active"
        });

        let selectedEmployee = null;

        // 3. ASSIGNMENT (Threshold < 3)
        if (matchingEmployees.length > 0) {
            for (const emp of matchingEmployees) {
                if (emp.assigned < 3) {
                    selectedEmployee = emp;
                    break;
                }
            }
        }

        // 4. UPDATE EMPLOYEE
        if (selectedEmployee) {
            leadData.assignedTo = selectedEmployee._id;
            selectedEmployee.assigned += 1;
            await selectedEmployee.save();
        }

        // 5. SAVE LEAD
        const newLead = new Lead(leadData);
        await newLead.save();

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


// ... existing imports ...

// --- CSV UPLOAD CONTROLLER ---// --- CSV UPLOAD CONTROLLER (FIXED) ---
export const uploadLeadsCSV = async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ success: false, message: "No CSV data found" });

        const rows = csvData.split(/\r?\n/);
        const cleanRows = rows.filter(row => row.trim() !== "");

        // 1. Fetch Active Employees
        const employees = await Employee.find({ status: "Active" });

        let leadsAdded = 0;

        for (let i = 1; i < cleanRows.length; i++) {
            const rowString = cleanRows[i];
            const cols = rowString.split(',');

            const name = cols[0]?.trim();
            const email = cols[1]?.trim().toLowerCase();
            const source = cols[2]?.trim();
            const date = cols[3]?.trim();
            const location = cols[4]?.trim();
            const language = cols[5]?.trim().toLowerCase();

            if (!name || !email) continue; 

            // --- Assignment Logic ---
            let assignedTo = null;
            const eligibleEmployees = employees.filter(emp => emp.language.toLowerCase() === language);

            let selectedEmployee = null;
            if (eligibleEmployees.length > 0) {
                for (const emp of eligibleEmployees) {
                    if (emp.assigned < 3) { // limit check
                        selectedEmployee = emp;
                        break; 
                    }
                }
            }

            if (selectedEmployee) {
                assignedTo = selectedEmployee._id;
                selectedEmployee.assigned += 1; // Memory Update
                await Employee.findByIdAndUpdate(selectedEmployee._id, { $inc: { assigned: 1 } }); // DB Update
            }

            // --- Safe Save Logic ---
            try {
                const newLead = new Lead({
                    name, email, source, date, location, language,
                    assignedTo, status: "ongoing", type: "-", scheduleDate: "-"
                });

                await newLead.save();
                leadsAdded++; // This only happens if save succeeds
            } catch (innerError) {
                console.log(`Skipping row ${i} (${email}): ${innerError.message}`);
                // Continue loop even if this row fails
            }
        }

        res.json({ success: true, count: leadsAdded, message: "CSV Processed" });

    } catch (error) {
        console.error("CSV Global Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};