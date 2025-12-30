import Lead from '../models/Lead.js';
import Employee from '../models/Employee.js';

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(today.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const [
            totalLeadsCount,
            closedLeadsCount,
            unassignedLeadsCount,
            assignedThisWeekCount,
            activeEmployeesCount,
            activeEmployeesList,
            recentLeadsRaw,
            recentEmployeesRaw,
            graphLeadsRaw,
            totalAssignedCount
        ] = await Promise.all([
            Lead.countDocuments({}),
            Lead.countDocuments({
                status: { $in: ["closed", "Closed"] }
            }),
            Lead.countDocuments({ assignedTo: null }),
            Lead.countDocuments({ assignedTo: { $ne: null }, updatedAt: { $gte: sevenDaysAgo } }),
            Employee.countDocuments({ status: "Active" }),
            Employee.find({ status: "Active" }).select('firstName lastName email employeeId assigned closed status').sort({ assigned: -1 }),
            Lead.find().sort({ updatedAt: -1 }).limit(10).populate('assignedTo', 'firstName'),
            // Fetch recently created employees (Limit 5)
            Employee.find().sort({ createdAt: -1 }).limit(5).select('firstName createdAt'),
            Lead.find({ updatedAt: { $gte: fourteenDaysAgo } }).select('updatedAt status assignedTo'),
            Lead.countDocuments({ assignedTo: { $ne: null } })
        ]);

        // KPI Conversion Rate
        const conversionRate = totalAssignedCount > 0
            ? ((closedLeadsCount / totalAssignedCount) * 100).toFixed(1)
            : 0;

        // --- 2. PROCESS ACTIVITY FEED (Merging Leads & Employees) ---
        let allActivities = [];

        // A. Process Lead Activities
        recentLeadsRaw.forEach(lead => {
            let message = "Lead updated";
            const empName = lead.assignedTo ? lead.assignedTo.firstName : "Unknown";

            if (lead.status && lead.status.toLowerCase() === 'closed') {

                message = `${empName} closed a deal`;
            } else if (lead.assignedTo) {
                const isNew = Math.abs(new Date(lead.createdAt) - new Date(lead.updatedAt)) < 1000;
                message = isNew ? `You assigned a lead to ${empName}` : `${empName} updated a lead`;
            } else {
                message = "You added a new unassigned lead";
            }

            allActivities.push({
                message: message,
                createdAt: lead.updatedAt,
                type: 'lead'
            });
        });

        // B. Process Employee Activities (New Employee Added)
        recentEmployeesRaw.forEach(emp => {
            allActivities.push({
                // Requested format: "You added new emp jaya"
                message: `You added new emp ${emp.firstName}`,
                createdAt: emp.createdAt,
                type: 'employee'
            });
        });

        // C. Sort merged list by Date (Newest first) and limit to 10 items
        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const finalActivities = allActivities.slice(0, 10);


        // --- 3. GRAPH CALCULATION ---
        const chartData = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayString = d.toLocaleDateString('en-US', { weekday: 'short' });

            const startOfDay = new Date(d); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(d); endOfDay.setHours(23, 59, 59, 999);

            const dailyLeads = graphLeadsRaw.filter(l =>
                new Date(l.updatedAt) >= startOfDay &&
                new Date(l.updatedAt) <= endOfDay
            );


            const dailyTotal = dailyLeads.length;
            const dailyClosed = dailyLeads.filter(l => l.status && l.status.toLowerCase() === 'closed').length;
            const dailyAssignedCount = dailyLeads.filter(l => l.assignedTo).length;

            let percentage = 0;
            // 3. Divide Closed by Assigned
            if (dailyAssignedCount > 0) {
                percentage = Math.round((dailyClosed / dailyAssignedCount) * 100);
            }

            chartData.push({ day: dayString, value: percentage });
        }

        res.json({
            success: true,
            stats: {
                unassigned: unassignedLeadsCount,
                assignedThisWeek: assignedThisWeekCount,
                activeCount: activeEmployeesCount,
                conversionRate: conversionRate,
                totalLeads: totalLeadsCount
            },
            employees: activeEmployeesList,
            activities: finalActivities,
            chartData: chartData
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};