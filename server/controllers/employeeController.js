// --- LOGIN CONTROLLER ---
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