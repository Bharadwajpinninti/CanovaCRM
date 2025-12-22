// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import './Leads.css';
// import Search from '../components/Searchbar';
// import Breadcrumbs from '../components/Breadcrumbs';
// import Pagination from '../components/Pagination';
// import AddLeadManual from '../components/AddLeadManual'; 
// import AddLeadCSV from '../components/AddLeadCSV'; 

// const Leads = () => {
//     const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
//     const ITEMS_PER_PAGE = 10;

//     // --- STATE ---
//     const [leads, setLeads] = useState([]);
//     const [filteredLeads, setFilteredLeads] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [searchTerm, setSearchTerm] = useState('');

//     // --- MODAL STATES ---
//     const [showModal, setShowModal] = useState(false);      // Manual Modal
//     const [showCSVModal, setShowCSVModal] = useState(false);  // CSV Modal

//     // --- 1. FETCH LEADS FROM BACKEND ---
//     const fetchLeads = useCallback(async () => {
//         try {
//             const { data } = await axios.get(`${backendUrl}/api/leads/all`); // Ensure this route exists or use a new lead route
//             // If you don't have a GET route yet, you might need to add one. 
//             // Assuming standard response structure: { success: true, leads: [...] }
//             if (data.success) {
//                 setLeads(data.leads);
//                 setFilteredLeads(data.leads);
//             }
//         } catch (error) {
//             console.error("Error fetching leads:", error);
//             // Fallback to empty if fails, or keep previous state
//         }
//     }, [backendUrl]);

//     useEffect(() => {
//         fetchLeads();
//     }, [fetchLeads]);

//     // --- 2. SEARCH FILTER ---
//     useEffect(() => {
//         const lowerTerm = searchTerm.toLowerCase();
//         const filtered = leads.filter(lead =>
//             lead.name.toLowerCase().includes(lowerTerm) ||
//             lead.email.toLowerCase().includes(lowerTerm)
//         );
//         setFilteredLeads(filtered);
//         setCurrentPage(1);
//     }, [searchTerm, leads]);

//     // --- 3. HANDLE STATUS CHANGE (The Decrement Logic) ---
//     const handleStatusChange = async (leadId, newStatus) => {
//         try {
//             const { data } = await axios.put(`${backendUrl}/api/leads/update-status`, {
//                 leadId: leadId,
//                 status: newStatus
//             });

//             if (data.success) {
//                 // Optimistically update UI or re-fetch
//                 alert("Status Updated!");
//                 fetchLeads(); // Refresh to ensure backend sync
//             } else {
//                 alert("Failed to update status");
//             }
//         } catch (error) {
//             console.error("Error updating status:", error);
//         }
//     };

//     // --- PAGINATION DATA ---
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const currentData = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//     return (
//         <div className="leads-container">
//             <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

//             <div className="page-content">
//                 <div className="page-header">
//                     <Breadcrumbs />
//                     <div className="btn-group">
//                         <button className="btn-manual" onClick={() => setShowModal(true)}>Add Manually</button>
//                         <button className="btn-csv" onClick={() => setShowCSVModal(true)}>Add CSV</button>
//                     </div>
//                 </div>

//                 {/* MAIN CARD */}
//                 <div className="leads-card">
//                     {/* HEADER ROW */}
//                     <div className="leads-table-header leads-grid">
//                         <div>No.</div>
//                         <div>Name</div>
//                         <div>Email</div>
//                         <div>Source</div>
//                         <div>Date</div>
//                         <div>Location</div>
//                         <div>Language</div>
//                         <div>Assigned To</div>
//                         <div>Status</div>
//                         <div>Type</div>
//                         <div>Scheduled Date</div>
//                     </div>

//                     {/* SCROLLABLE ROWS */}
//                     <div className="leads-table-body">
//                         {currentData.length > 0 ? (
//                             currentData.map((lead, index) => (
//                                 <div key={lead._id || index} className="leads-row leads-grid">
//                                     <div>{startIndex + index + 1}</div>
//                                     <div style={{ fontWeight: 600 }}>{lead.name}</div>
//                                     <div>{lead.email}</div>
//                                     <div>{lead.source}</div>
//                                     <div>{lead.date}</div>
//                                     <div>{lead.location}</div>
//                                     <div>{lead.language}</div>
                                    
//                                     {/* Assigned To - Handle null/populated object */}
//                                     <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
//                                         {lead.assignedTo ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.firstName : lead.assignedTo) : "Unassigned"}
//                                     </div>

//                                     {/* STATUS DROPDOWN (Triggers Logic) */}
//                                     <div>
//                                         <select 
//                                             value={lead.status} 
//                                             onChange={(e) => handleStatusChange(lead._id, e.target.value)}
//                                             className={`status-pill ${lead.status}`}
//                                             style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
//                                         >
//                                             <option value="ongoing">Ongoing</option>
//                                             <option value="closed">Closed</option>
//                                             <option value="negotiation">Negotiation</option>
//                                             {/* Add other status options as needed */}
//                                         </select>
//                                     </div>

//                                     <div>{lead.type}</div>
//                                     <div>{lead.scheduleDate || "-"}</div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="no-data">No Leads Found</div>
//                         )}
//                     </div>

//                     {/* PAGINATION AT BOTTOM */}
//                     <div className="pagination-wrapper">
//                         <Pagination
//                             currentPage={currentPage}
//                             totalItems={filteredLeads.length}
//                             itemsPerPage={ITEMS_PER_PAGE}
//                             onPageChange={setCurrentPage}
//                         />
//                     </div>
//                 </div>

//                 {/* --- MODAL COMPONENTS --- */}
                
//                 {/* 1. Add Manually Modal */}
//                 <AddLeadManual 
//                     isOpen={showModal}
//                     onClose={() => setShowModal(false)}
//                     onLeadAdded={fetchLeads} // Pass fetch function to refresh list after add
//                 />

//                 {/* 2. Add CSV Modal */}
//                 <AddLeadCSV 
//                     isOpen={showCSVModal}
//                     onClose={() => setShowCSVModal(false)}
//                     onLeadAdded={fetchLeads} // Pass fetch function here too if CSV component supports it
//                 />
//             </div>
//         </div>
//     );
// };

// export default Leads;


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
    if (!dateString) return "-";
    // Assuming backend sends YYYY-MM-DD (from input type="date")
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString; // Fallback
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
                                    <div>{formatDate(lead.date)}</div>
                                    
                                    <div>{lead.location}</div>
                                    <div>{lead.language}</div>
                                    
                                    {/* 3. ASSIGNED TO: Show Employee ID */}
                                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {lead.assignedTo ? lead.assignedTo.employeeId : "Unassigned"}
                                    </div>

                                    {/* 2. REMOVED DROPDOWN: Read-Only Status */}
                                    <div>
                                        <span className={`pill ${lead.status ? lead.status.toLowerCase() : ''}`}>
                                            {lead.status || "ongoing"}
                                        </span>
                                    </div>

                                    {/* Read-Only Type */}
                                    <div>{lead.type}</div>
                                    <div>{lead.scheduleDate || "-"}</div>
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