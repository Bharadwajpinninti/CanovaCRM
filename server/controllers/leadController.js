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

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Fetch the EXISTING lead first
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // --- LOGIC: If 'status' is being updated ---
    if (updateData.status) {
      const newStatus = updateData.status.toLowerCase(); 
      const oldStatus = lead.status ? lead.status.toLowerCase() : "";

      // CASE: Switching to "Closed"
      if (newStatus === 'closed') {

        // A. SECURITY CHECK: Time Validation
        if (lead.scheduleDate) {
          const now = new Date();
          const scheduleTime = new Date(lead.scheduleDate);

          if (now < scheduleTime) {
            return res.status(400).json({ 
              message: "Cannot close lead before the scheduled time." 
            });
          }
        }

        // B. EMPLOYEE COUNT: Increment 'closed' / Decrement 'assigned'
        // Only run if it was NOT already closed
        if (oldStatus !== 'closed') {
          if (lead.assignedTo) {
            const employee = await Employee.findById(lead.assignedTo);
            if (employee) {
              
              // Decrement assigned (safety check)
              if (employee.assigned > 0) employee.assigned -= 1;
              
              // Increment closed
              employee.closed = (employee.closed || 0) + 1;
              
              await employee.save();
            }
          }
        }
      }
    }

    // 2. Perform the Final Update
    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json(updatedLead);

  } catch (error) {
    console.error("[SERVER ERROR] Error updating lead:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- GET ALL LEADS (Updated) ---
export const getAllLeads = async (req, res) => {
    try {
       
        const leads = await Lead.find()
            .populate('assignedTo', 'firstName lastName employeeId') 
            .sort({ createdAt: -1 });

        res.json({ success: true, leads });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};





// --- CSV UPLOAD CONTROLLER ---
export const uploadLeadsCSV = async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ success: false, message: "No CSV data found" });

        const rows = csvData.split(/\r?\n/);
        // Remove header row and empty rows
        const dataRows = rows.slice(1).filter(row => row.trim() !== "");

        // Fetch active employees
        const employees = await Employee.find({ status: "Active" });

        const leadsToInsert = [];
        const employeeUpdates = {}; // Track count updates per employee

        // Process rows in memory first
        for (const rowString of dataRows) {
            // Regex to handle commas inside quotes correctly
            const cols = rowString.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rowString.split(',');

            const name = cols[0]?.replace(/"/g, "").trim();
            const email = cols[1]?.replace(/"/g, "").trim().toLowerCase();
            const source = cols[2]?.replace(/"/g, "").trim();
            const date = cols[3]?.replace(/"/g, "").trim();
            const location = cols[4]?.replace(/"/g, "").trim();
            const leadLanguage = cols[5]?.replace(/"/g, "").trim();

            if (!name || !email) continue;

            // Filter employees by language
            let eligibleEmployees = employees.filter(emp => {
                const empLang = emp.language ? emp.language.toLowerCase() : "";
                return empLang === (leadLanguage ? leadLanguage.toLowerCase() : "");
            });

            // Sort by least loaded for equal distribution
            eligibleEmployees.sort((a, b) => (a.currentLeadCount || 0) - (b.currentLeadCount || 0));

            let selectedEmployee = null;

            // Check threshold limit (< 3)
            for (const emp of eligibleEmployees) {
                if ((emp.currentLeadCount || 0) < 3) {
                    selectedEmployee = emp;
                    break;
                }
            }

            let assignedTo = null;

            if (selectedEmployee) {
                assignedTo = selectedEmployee._id;

                // Update in-memory count immediately for next iteration
                selectedEmployee.currentLeadCount = (selectedEmployee.currentLeadCount || 0) + 1;
                selectedEmployee.assigned = (selectedEmployee.assigned || 0) + 1;

                // Track for bulk DB update
                if (!employeeUpdates[selectedEmployee._id]) {
                    employeeUpdates[selectedEmployee._id] = 0;
                }
                employeeUpdates[selectedEmployee._id]++;
            }

            leadsToInsert.push({
                name,
                email,
                source,
                date,
                location,
                language: leadLanguage,
                assignedTo,
                status: "ongoing",
                type: "-",
                scheduleDate: "-"
            });
        }

        // Insert all leads at once
        const leadInsertPromise = Lead.insertMany(leadsToInsert);

        // Prepare bulk employee updates
        const empUpdatePromises = Object.keys(employeeUpdates).map(empId => {
            const count = employeeUpdates[empId];
            return Employee.findByIdAndUpdate(empId, {
                $inc: { currentLeadCount: count, assigned: count }
            });
        });

        // Execute all DB operations in parallel
        await Promise.all([
            leadInsertPromise,
            ...empUpdatePromises
        ]);

        res.json({ success: true, count: leadsToInsert.length, message: "CSV Processed Successfully" });

    } catch (error) {
        console.error("CSV Global Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const getAssignedLeads = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1. Find leads where assignedId matches the parameter
    // 2. Sort by createdAt in descending order (Newest first) 
    //    so the dashboard "Recent Activity" puts new stuff at the top.
    const leads = await Lead.find({ assignedTo: employeeId }).sort({ createdAt: -1 });

    if (!leads) {
      return res.status(200).json([]); // Return empty array if no leads found
    }

    res.status(200).json(leads);
  } catch (error) {
    console.error("Error in getAssignedLeads:", error);
    res.status(500).json({ message: "Server Error fetching assigned leads" });
  }
};



// Get leads that have a schedule date set
export const getScheduledLeads = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leads = await Lead.find({
      assignedTo: employeeId,
      scheduleDate: { $exists: true, $ne: null, $ne: "-" } // Only fetches if date exists and isn't empty
    }).sort({ scheduleDate: 1 }); // Sort by date (nearest first)

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};