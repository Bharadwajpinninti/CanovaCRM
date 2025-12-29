import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Search from '../components/Searchbar';
import Breadcrumbs from '../components/Breadcrumbs';

// --- ICONS ---
import unassignedIcon from '../assets/icon-unassigned-leads.png';
import assignedIcon from '../assets/icon-assigned-this-week.png';
import activeIcon from '../assets/icon-active-salespeople.png';
import conversionIcon from '../assets/icon-conversion-rate.png';

// --- RECHARTS (Graph) ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// --- HELPER 1: Initials ---
const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName[0] : "";
    const l = lastName ? lastName[0] : "";
    return (f + l).toUpperCase();
};

// --- HELPER 2: Relative Time (Fixed Grammar) ---
const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        const count = Math.floor(interval);
        return count + (count === 1 ? " year ago" : " years ago");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const count = Math.floor(interval);
        return count + (count === 1 ? " month ago" : " months ago");
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const count = Math.floor(interval);
        return count + (count === 1 ? " day ago" : " days ago");
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const count = Math.floor(interval);
        return count + (count === 1 ? " hour ago" : " hours ago");
    }
    interval = seconds / 60;
    if (interval > 1) {
        const count = Math.floor(interval);
        return count + (count === 1 ? " minute ago" : " minutes ago");
    }
    return "Just now";
};

const Dashboard = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Data State
    const [stats, setStats] = useState({
        unassigned: 0,
        assignedThisWeek: 0,
        activeCount: 0,
        conversionRate: 0
    });
    const [employees, setEmployees] = useState([]);
    const [activities, setActivities] = useState([]);
    const [chartData, setChartData] = useState([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/dashboard/stats`);
                if (data.success) {
                    setStats(data.stats);
                    setEmployees(data.employees);
                    setActivities(data.activities || []);
                    setChartData(data.chartData || []); 
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [backendUrl]);

    // --- UPDATED FILTER LOGIC ---
    // Searches First Name, Last Name, Full Name, or Email
    const filteredEmployees = employees.filter(emp => {
        const term = searchTerm.toLowerCase();
        const first = (emp.firstName || "").toLowerCase();
        const last = (emp.lastName || "").toLowerCase();
        const email = (emp.email || "").toLowerCase();
        const fullName = `${first} ${last}`;

        return first.includes(term) || 
               last.includes(term) || 
               fullName.includes(term) || 
               email.includes(term);
    });

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container"><div className="spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

            <div className="page-content">
                <div className="page-header">
                    <Breadcrumbs />
                </div>

                {/* --- KPI SECTION --- */}
                <section className="kpi-row">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper"><img src={unassignedIcon} alt="Unassigned" className="kpi-icon-img" /></div>
                        <div className="kpi-info"><span className="kpi-label">Unassigned Leads</span><h3 className="kpi-value">{stats.unassigned}</h3></div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper"><img src={assignedIcon} alt="Assigned" className="kpi-icon-img" /></div>
                        <div className="kpi-info"><span className="kpi-label">Assigned This Week</span><h3 className="kpi-value">{stats.assignedThisWeek}</h3></div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper"><img src={activeIcon} alt="Active" className="kpi-icon-img" /></div>
                        <div className="kpi-info"><span className="kpi-label">Active Salespeople</span><h3 className="kpi-value">{stats.activeCount}</h3></div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper"><img src={conversionIcon} alt="Conversion" className="kpi-icon-img" /></div>
                        <div className="kpi-info"><span className="kpi-label">Conversion Rate</span><h3 className="kpi-value">{stats.conversionRate}%</h3></div>
                    </div>
                </section>

                <section className="middle-section">
                    {/* --- CHART SECTION --- */}
                    <div className="chart-card">
                        <h3 className="card-title">Sale Analytics</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={20}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6B7280', fontSize: 10 }} 
                                        dy={10} 
                                        interval={0} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6B7280', fontSize: 11 }} 
                                        tickFormatter={(value) => `${value}%`} 
                                        domain={[0, 60]} // Scale
                                        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80,90,100]} // Steps
                                    />
                                    <Bar dataKey="value" fill="#D1D5DB" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- ACTIVITY FEED --- */}
                    <div className="activity-card">
                        <h3 className="card-title">Recent Activity Feed</h3>
                        <ul className="activity-list">
                            {activities.length > 0 ? (
                                activities.map((act, index) => (
                                    <li key={index} className="activity-item">
                                        <div className="activity-text">
                                            {act.message} <br /> 
                                            <span className="time">– {timeAgo(act.createdAt)}</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="activity-item">
                                    <div className="activity-text">No recent activity</div>
                                </li>
                            )}
                        </ul>
                    </div>
                </section>

                {/* --- EMPLOYEE TABLE --- */}
                <section className="table-card">
                    <div className="table-header">
                        <div className="col name-col">Name</div>
                        <div className="col id-col">Employee ID</div>
                        <div className="col assigned-col">Assigned</div>
                        <div className="col closed-col">Closed</div>
                        <div className="col status-col">Status</div>
                    </div>

                    <div className="table-body-scroll">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <div key={emp._id} className="table-row">
                                    <div className="col name-col user-cell">
                                        <div className="avatar-circle">
                                            {getInitials(emp.firstName, emp.lastName)}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{emp.firstName} {emp.lastName}</span>
                                            <span className="user-email">{emp.email}</span>
                                        </div>
                                    </div>
                                    <div className="col id-col">
                                        <span className="id-chip">
                                            {emp.employeeId || emp._id || "N/A"}
                                        </span>
                                    </div>
                                    <div className="col assigned-col">{emp.assigned}</div>
                                    <div className="col closed-col">{emp.closed}</div>
                                    <div className="col status-col">
                                        <span className={`status-pill ${emp.status?.toLowerCase()}`}>
                                            <span className="dot"></span> {emp.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* --- UI UPDATE: Centered & Grey Empty State --- */
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '150px',
                                color: '#9CA3AF', // Grey Color
                                fontSize: '15px',
                                width: '100%',
                                fontWeight: 500
                            }}>
                                No active employees found
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;