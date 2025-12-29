import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js'; // Added missing import
import bcrypt from 'bcryptjs';

// 1. GET: Fetch Admin Details
const getAdminSettings = async (req, res) => {
    try {
        const admin = await Admin.findOne(); 

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({
            success: true,
            admin: {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. PUT: Update Admin Profile
const updateAdminSettings = async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        admin.firstName = firstName;
        admin.lastName = lastName;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        await admin.save();
        res.json({ success: true, message: "Profile Updated Successfully!" });
    } catch (error) {
        console.error("Error updating admin settings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3.Adds the employee
const addEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, location, language } = req.body;

       
        const cleanEmail = email.toLowerCase();
        const cleanLanguage = language.toLowerCase(); 
        
       
        const existingEmployee = await Employee.findOne({ email: cleanEmail });
        if (existingEmployee) {
            return res.json({ success: false, message: "Employee with this email already exists." });
        }

        // 3. Create the Employee Object
        const newEmployee = new Employee({
            firstName,
            lastName,
            email: cleanEmail,
            location,
            language: cleanLanguage // Storing "english"
        });

        // 4. Set employeeId
        newEmployee.employeeId = newEmployee._id; 

        await newEmployee.save();

        res.json({ success: true, message: "Employee added successfully!" });

    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL EMPLOYEES ---
 const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ dateJoined: -1 });
        res.json({ success: true, employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




// --- EDIT EMPLOYEE (PUT) ---
const editEmployee = async (req, res) => {
    try {
        const { id, firstName, lastName, location } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { firstName, lastName, location }, // Only update allowed fields
            { new: true } // Return the updated document
        );

        if (!updatedEmployee) {
            return res.json({ success: false, message: "Employee not found" });
        }

        res.json({ success: true, message: "Employee updated successfully!" });
    } catch (error) {
        console.error("Error editing employee:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELETE EMPLOYEE (DELETE) ---
const deleteEmployee = async (req, res) => {
    try {
        const { id, ids } = req.body; 

        // CASE 1: Bulk Delete (if 'ids' array is provided)
        if (ids && ids.length > 0) {
            await Employee.deleteMany({ _id: { $in: ids } });
            return res.json({ success: true, message: `${ids.length} Employees deleted successfully!` });
        }

        // CASE 2: Single Delete
        if (id) {
            const deletedEmployee = await Employee.findByIdAndDelete(id);
            if (!deletedEmployee) return res.json({ success: false, message: "Employee not found" });
            return res.json({ success: true, message: "Employee deleted successfully!" });
        }

        res.json({ success: false, message: "No IDs provided" });

    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




// --- ALL EXPORTS AT THE END ---
export {
    getAdminSettings,
    updateAdminSettings,
    addEmployee,
    editEmployee,
    deleteEmployee,
    getAllEmployees
};