import Employee from '../models/Employee.js';
export const requireCheckIn = async (req, res, next) => {
    try {
        // Get ID from Token (req.user) or Params
        const userId = req.user?.id || req.params.id || req.body.employeeId;
        if (!userId) return res.status(400).json({ message: "User ID missing" });
        const emp = await Employee.findById(userId);
        if (!emp || emp.checkInStatus !== true) {
            return res.status(403).json({ 
                success: false, 
                message: "To access leads you need to checkin" 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};