// --- LOGIN CONTROLLER ---

import Employee from "../models/Employee.js";
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate Input
        if (!email || !password) {
            return res.json({ success: false, message: "Email and Password are required" });
        }

        // 2. Find Employee in DB
        // (Use regex to make it case-insensitive if you want)
        const employee = await Employee.findOne({ email: email.toLowerCase() });
        console.log(employee);

        if (!employee) {
            return res.json({ success: false, message: "User not found" });
        }

        // 3. Check Password Rule: "Password must match Email"
        if (password !== email) {
            return res.json({ success: false, message: "Invalid Password" });
        }

        // 4. SUCCESS: Send back the Name and Details!
        res.json({ 
            success: true, 
            message: "Login Successful",
            user: {
                _id: employee._id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: "employee" // You can modify this if you have admins
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export  const updateProfileName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    // Find user by ID and update ONLY the names
    // { new: true } returns the updated document
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName },
      { new: true, runValidators: true } 
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: "Profile updated successfully",
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName
    });

  } catch (error) {
    res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
};


export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects { status: 'Active' } or { status: 'Inactive' }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ 
      message: `Status updated to ${status}`, 
      employee: updatedEmployee 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
