import Employee from '../models/Employee.js';

// --- 1. GET DASHBOARD STATUS ---
export const getDashboardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findById(id);
        
        if (!emp) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const today = new Date().toDateString();
        const lastUpdateDate = new Date(emp.updatedAt).toDateString();

        if (lastUpdateDate !== today) {
            emp.checkInStatus = null;
            emp.breakStatus = null;
            emp.lastCheckInTime = null;
            emp.lastCheckOutTime = null;
            await emp.save();
        }

        res.json({
            success: true,
            checkInStatus: emp.checkInStatus,
            breakStatus: emp.breakStatus,
            checkInTime: emp.lastCheckInTime,
            checkOutTime: emp.lastCheckOutTime,
            breakHistory: emp.breakHistory || []
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. TOGGLE ATTENDANCE (Check In / Check Out) ---
export const toggleAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        
        const timeNow = new Date().toLocaleTimeString('en-US', { 
            timeZone: 'Asia/Kolkata', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const emp = await Employee.findById(id);
        
        if (status === 'Active') {
            emp.status = 'Active';
            emp.checkInStatus = true;      
            emp.lastCheckInTime = timeNow; 
            emp.lastCheckOutTime = null;   
            emp.breakStatus = null;        
        } 
        else {
            emp.status = 'Inactive';
            emp.checkInStatus = false;     
            emp.lastCheckOutTime = timeNow; 
            
            if (emp.breakStatus === true) {
                emp.breakStatus = false;
            }
        }

        await emp.save();
        res.json({ success: true, checkInStatus: emp.checkInStatus, time: timeNow });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. TOGGLE BREAK (Start / End) ---
export const toggleBreak = async (req, res) => {
    try {
        const { id } = req.params;

        const timeNow = new Date().toLocaleTimeString('en-US', { 
            timeZone: 'Asia/Kolkata', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const todayDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });

        const emp = await Employee.findById(id);

        if (emp.breakStatus === null) {
            emp.breakStatus = true; 
            emp.breakHistory.unshift({ 
                break: timeNow, 
                ended: "...", 
                date: todayDate 
            });
        } 
        else if (emp.breakStatus === true) {
            emp.breakStatus = false; 
            if (emp.breakHistory.length > 0) {
                emp.breakHistory[0].ended = timeNow;
            }
        }

        await emp.save();
        
        res.json({ 
            success: true, 
            breakStatus: emp.breakStatus, 
            history: emp.breakHistory 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};