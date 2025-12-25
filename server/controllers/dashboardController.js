import Lead from '../models/Lead.js';
import Employee from '../models/Employee.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Define "Start of This Week" (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 2. Run all queries in PARALLEL using Promise.all (Fastest Way)
        const [
            totalLeadsCount,
            closedLeadsCount,
            unassignedLeadsCount,
            assignedThisWeekCount,
            activeEmployeesCount,
            activeEmployeesList
        ] = await Promise.all([
            // A. Total Leads (For Conversion Rate)
            Lead.countDocuments({}),

            // B. Closed Leads (For Conversion Rate)
            Lead.countDocuments({ status: "closed" }),

            // C. Unassigned Leads (KPI 1)
            Lead.countDocuments({ assignedTo: null }),

            // D. Assigned This Week (KPI 2)
            // Checks for leads assigned within last 7 days
            Lead.countDocuments({ 
                assignedTo: { $ne: null }, 
                updatedAt: { $gte: sevenDaysAgo } 
            }),

            // E. Active Salespeople Count (KPI 3)
            Employee.countDocuments({ status: "Active" }),

            // F. Active Employees List (For the Table)
            Employee.find({ status: "Active" })
                .select('firstName lastName email employeeId assigned closed status') // Only needed fields
                .sort({ assigned: -1 }) // Optional: Sort by most busy
        ]);

        // 3. Calculate Conversion Rate (Avoid Division by Zero)
        const conversionRate = totalLeadsCount > 0 
            ? ((closedLeadsCount / totalLeadsCount) * 100).toFixed(1) 
            : 0;

        // 4. Send Response
        res.json({
            success: true,
            stats: {
                unassigned: unassignedLeadsCount,
                assignedThisWeek: assignedThisWeekCount,
                activeCount: activeEmployeesCount,
                conversionRate: conversionRate,
                totalLeads: totalLeadsCount
            },
            employees: activeEmployeesList
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};