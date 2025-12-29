
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Leads.css';
import Search from '../components/Searchbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import AddLeadManual from '../components/AddLeadManual'; 
import AddLeadCSV from '../components/AddLeadCSV'; 

// --- HELPER: Format Date to DD-MM-YYYY ---
const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    
    // Create a Date object from the string (handles ISO 2025-12-31T...)
    const date = new Date(dateString);
    
    // If invalid date, return original string
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    

    return `${day}-${month}-${year}`;
};

const Leads = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    const ITEMS_PER_PAGE = 10;

    // --- STATE ---
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // --- MODAL STATES ---
    const [showModal, setShowModal] = useState(false);      
    const [showCSVModal, setShowCSVModal] = useState(false); 

    // --- 1. FETCH LEADS ---
    const fetchLeads = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/leads/all`); 
            if (data.success) {
                setLeads(data.leads);
                setFilteredLeads(data.leads);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // --- 2. SEARCH FILTER ---
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = leads.filter(lead =>
            lead.name.toLowerCase().includes(lowerTerm) ||
            lead.email.toLowerCase().includes(lowerTerm)
        );
        setFilteredLeads(filtered);
        setCurrentPage(1);
    }, [searchTerm, leads]);

    // --- PAGINATION ---
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="leads-container">
            <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

            <div className="page-content">
                <div className="page-header">
                    <Breadcrumbs />
                    <div className="btn-group">
                        <button className="btn-manual" onClick={() => setShowModal(true)}>Add Manually</button>
                        <button className="btn-csv" onClick={() => setShowCSVModal(true)}>Add CSV</button>
                    </div>
                </div>

                {/* MAIN CARD */}
                <div className="leads-card">
                    {/* HEADER ROW */}
                    <div className="leads-table-header leads-grid">
                        <div>No.</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Source</div>
                        <div>Date</div>
                        <div>Location</div>
                        <div>Language</div>
                        <div>Assigned To</div>
                        <div>Status</div>
                        <div>Type</div>
                        <div>Scheduled Date</div>
                    </div>

                    {/* SCROLLABLE ROWS */}
                    <div className="leads-table-body">
                        {currentData.length > 0 ? (
                            currentData.map((lead, index) => (
                                <div key={lead._id || index} className="leads-row leads-grid">
                                    <div>{startIndex + index + 1}</div>
                                    <div style={{ fontWeight: 600 }}>{lead.name}</div>
                                    <div>{lead.email}</div>
                                    <div>{lead.source}</div>
                                    
                                    {/* 1. DATE FORMAT FIX (DD-MM-YYYY) */}
                                    <div>{lead.date}</div>
                                    
                                    <div>{lead.location}</div>
                                    <div>{lead.language}</div>
                                    
                                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {lead.assignedTo ? lead.assignedTo.employeeId : "Unassigned"}
                                    </div>

                                    <div>
                                        <span className={`pill ${lead.status ? lead.status.toLowerCase() : ''}`}>
                                            {lead.status || "ongoing"}
                                        </span>
                                    </div>

                                    <div>{lead.type}</div>
                                    
                                    {/* --- 2. FIXED SCHEDULE DATE DISPLAY --- */}
                                    {/* Applied formatDate to clean up the ISO string */}
                                    <div>{formatDate(lead.scheduleDate)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No Leads Found</div>
                        )}
                    </div>

                    <div className="pagination-wrapper">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredLeads.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>

                <AddLeadManual 
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onLeadAdded={fetchLeads} 
                />

                <AddLeadCSV 
                    isOpen={showCSVModal}
                    onClose={() => setShowCSVModal(false)}
                    onLeadAdded={fetchLeads} 
                />
            </div>
        </div>
    );
};

export default Leads;