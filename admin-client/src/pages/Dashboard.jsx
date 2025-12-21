import React, { useState } from 'react';
import './Dashboard.css';
import Search from '../components/Searchbar' // Reusable Search Component
import Breadcrumbs from '../components/Breadcrumbs';

// --- IMAGE IMPORTS (Uncomment when assets are ready) ---

import unassignedIcon from '../assets/icon-unassigned-leads.png';
import assignedIcon from '../assets/icon-assigned-this-week.png';
import activeIcon from '../assets/icon-active-salespeople.png';
import conversionIcon from '../assets/icon-conversion-rate.png';


// --- RECHARTS IMPORTS ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// --- HELPER FUNCTION ---
const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

// --- MOCK DATA ---
const chartData = [
    { day: 'Sat', value: 20 }, { day: 'Sun', value: 35 }, { day: 'Mon', value: 22 },
    { day: 'Tue', value: 10 }, { day: 'Wed', value: 22 }, { day: 'Thu', value: 55 },
    { day: 'Fri', value: 45 }, { day: 'Sat', value: 35 }, { day: 'Sun', value: 20 },
    { day: 'Mon', value: 28 }, { day: 'Tue', value: 24 }, { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 },
];

const employees = [
    { id: 1, name: 'Tanner Finsha', email: 'Tannerfisher@gmail.com', empId: '#23454GH6J7YT6', assigned: 5, closed: 2, status: 'Active' },
    { id: 2, name: 'Emeto Winner', email: 'Emetowinner@gmail.com', empId: '#23454GH6J7YT6', assigned: 3, closed: 1, status: 'Active' },
    { id: 3, name: 'Sarah Connor', email: 'Sarahconnor@gmail.com', empId: '#23454GH6J7YT6', assigned: 8, closed: 3, status: 'Active' },
    { id: 4, name: 'Tassy Omah', email: 'Tassyomah@gmail.com', empId: '#23454GH6J7YT6', assigned: 6, closed: 4, status: 'Active' },
];

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="dashboard-container">
            
            {/* 1. TOP SEARCH BAR */}
            <Search 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />

            <div className="page-content">
                {/* Breadcrumb */}
                <div className="page-header"> 
             <Breadcrumbs /> 
        </div>

                {/* KPI Cards */}
                <section className="kpi-row">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper">
                            <img src={unassignedIcon} alt="Icon" className="kpi-icon-img" />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Unassigned Leads</span>
                            <h3 className="kpi-value">12</h3>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper">
                            <img src={assignedIcon} alt="Icon" className="kpi-icon-img" />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Assigned This Week</span>
                            <h3 className="kpi-value">24</h3>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper">
                            <img src={activeIcon} alt="Icon" className="kpi-icon-img" />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Salespeople</span>
                            <h3 className="kpi-value">5</h3>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper">
                            <img src={conversionIcon} alt="Icon" className="kpi-icon-img" />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Conversion Rate</span>
                            <h3 className="kpi-value">32%</h3>
                        </div>
                    </div>
                </section>

                {/* Middle Section: Chart & Activity */}
                <section className="middle-section">
                    
                    {/* Chart */}
                    <div className="chart-card">
                        <h3 className="card-title">Sale Analytics</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={15}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(value) => `${value}%`} domain={[0, 60]} ticks={[0, 10, 20, 30, 40, 50, 60]} />
                                    <Bar dataKey="value" fill="#D1D5DB" radius={[4, 4, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="activity-card">
                        <h3 className="card-title">Recent Activity Feed</h3>
                        <ul className="activity-list">
                            <li className="activity-item">
                                
                                <div className="activity-text">
                                    You assigned a lead to <br /> Priya – <span className="time">1 hour ago</span>
                                </div>
                            </li>
                            <li className="activity-item">
                                
                                <div className="activity-text">
                                    Jay closed a deal <br /> – <span className="time">2 hours ago</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Employee Table */}
                <section className="table-card">
                    <div className="table-header">
                        <div className="col name-col">Name</div>
                        <div className="col id-col">Employee ID</div>
                        <div className="col assigned-col">Assigned Leads</div>
                        <div className="col closed-col">Closed Leads</div>
                        <div className="col status-col">Status</div>
                    </div>

                    <div className="table-body-scroll">
                        {employees.map((emp) => (
                            <div key={emp.id} className="table-row">
                                <div className="col name-col user-cell">
                                    <div className="avatar-circle">
                                        {getInitials(emp.name)}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{emp.name}</span>
                                        <span className="user-email">{emp.email}</span>
                                    </div>
                                </div>
                                <div className="col id-col">
                                    <span className="id-chip">{emp.empId}</span>
                                </div>
                                <div className="col assigned-col">{emp.assigned}</div>
                                <div className="col closed-col">{emp.closed}</div>
                                <div className="col status-col">
                                    <span className="status-pill active">
                                        <span className="dot"></span> {emp.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;