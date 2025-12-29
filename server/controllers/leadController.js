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
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 

    console.log("--------------------------------------------------");
    console.log(`[DEBUG] Update Request for Lead ID: ${id}`);
    console.log(`[DEBUG] Request Body:`, updateData);

    // 1. Fetch the EXISTING lead first
    const lead = await Lead.findById(id);
    if (!lead) {
      console.log(`[ERROR] Lead not found.`);
      return res.status(404).json({ message: "Lead not found" });
    }

    // --- LOGIC: If 'status' is being updated ---
    if (updateData.status) {
      const newStatus = updateData.status.toLowerCase(); 
      const oldStatus = lead.status ? lead.status.toLowerCase() : "";

      console.log(`[DEBUG] Status Change Detected: "${oldStatus}" -> "${newStatus}"`);

      // CASE: Switching to "Closed"
      if (newStatus === 'closed') {

        // A. SECURITY CHECK: Time Validation
        if (lead.scheduleDate) {
          const now = new Date();
          const scheduleTime = new Date(lead.scheduleDate);
          
          console.log(`[DEBUG] Time Check: Now (${now.toISOString()}) vs Schedule (${scheduleTime.toISOString()})`);

          if (now < scheduleTime) {
            console.log(`[BLOCKED] Attempt to close before schedule time.`);
            return res.status(400).json({ 
              message: "Cannot close lead before the scheduled time." 
            });
          }
        } else {
            console.log(`[DEBUG] No schedule date found, skipping time check.`);
        }

        // B. EMPLOYEE COUNT: Increment 'closed' / Decrement 'assigned'
        // Only run if it was NOT already closed
        if (oldStatus !== 'closed') {
          if (lead.assignedTo) {
            const employee = await Employee.findById(lead.assignedTo);
            if (employee) {
              console.log(`[DEBUG] Found Employee: ${employee.firstName} (Assigned: ${employee.assigned}, Closed: ${employee.closed})`);
              
              // Decrement assigned (safety check)
              if (employee.assigned > 0) employee.assigned -= 1;
              
              // Increment closed
              employee.closed = (employee.closed || 0) + 1;
              
              await employee.save();
              console.log(`[SUCCESS] Updated Stats -> Assigned: ${employee.assigned}, Closed: ${employee.closed}`);
            } else {
              console.log(`[ERROR] Assigned Employee (ID: ${lead.assignedTo}) not found in DB.`);
            }
          } else {
            console.log(`[DEBUG] Lead has no assigned employee. Skipping stats update.`);
          }
        } else {
          console.log(`[DEBUG] Lead was ALREADY closed. Skipping employee stat update.`);
        }
      }
    }

    // 2. Perform the Final Update
    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    
    console.log(`[SUCCESS] Lead updated successfully.`);
    console.log("--------------------------------------------------");

    res.status(200).json(updatedLead);

  } catch (error) {
    console.error("[SERVER ERROR] Error updating lead:", error);
    res.status(500).json({ message: "Server Error" });
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


// export const updateLead = async (req, res) => {
//   try {
//     const { id } = req.params; // The Lead ID
//     const updateData = req.body; // Data sent from frontend (e.g., { type: 'HOT' })

//     // If updating status to 'Closed', perform the Time Check on the server side too for security
//     if (updateData.status === 'Closed') {
//       const lead = await Lead.findById(id);
//       if (lead.scheduleDate) {
//         const now = new Date();
//         const scheduleTime = new Date(lead.scheduleDate);
        
//         if (now < scheduleTime) {
//           return res.status(400).json({ 
//             message: "Cannot close lead before the scheduled time." 
//           });
//         }
//       }
//     }

//     const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

//     if (!updatedLead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     res.status(200).json(updatedLead);
//   } catch (error) {
//     console.error("Error updating lead:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


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