import React, { useState, useEffect } from 'react';
import './Leads.css';
import Search from '../components/Searchbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import AddLeadManual from '../components/AddLeadManual'; 
import AddLeadCSV from '../components/AddLeadCSV'; // Import the new CSV component

// --- MOCK DATA GENERATOR ---
const generateMockLeads = () => {
    const data = [];
    for (let i = 1; i <= 50; i++) {
        data.push({
            id: i,
            name: "John Smith",
            email: "johnsmit@gmail.com",
            source: "Referral",
            date: "08-12-2025",
            location: "Mumbai",
            language: "English",
            assignedTo: "47f5-2g6t-t6hhu",
            status: "Ongoing",
            type: "Warm",
            scheduledDate: "12-12-2025"
        });
    }
    return data;
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // --- MODAL STATES ---
    const [showModal, setShowModal] = useState(false);        // Manual Modal
    const [showCSVModal, setShowCSVModal] = useState(false);  // CSV Modal
    
    const [newLead, setNewLead] = useState({
        name: '', 
        email: '', 
        source: '', 
        date: '', 
        location: '', 
        language: '' // Starts empty as requested
    });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setLeads(generateMockLeads());
    }, []);

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // --- HANDLER FOR MANUAL MODAL SAVE ---
    const handleSaveManual = (e) => {
        e.preventDefault();
        const createdLead = {
            ...newLead,
            id: leads.length + 1,
            assignedTo: "Unassigned",
            status: "Ongoing",
            type: "-",
            scheduledDate: "-"
        };
        setLeads([createdLead, ...leads]);
        setShowModal(false);
        // Reset form to empty
        setNewLead({ name: '', email: '', source: '', date: '', location: '', language: '' });
    };

    return (
        <div className="leads-container">
            <Search value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />

            <div className="page-content">
                <div className="page-header">
                    <Breadcrumbs />
                    <div className="btn-group">
                        <button className="btn-manual" onClick={() => setShowModal(true)}>Add Manually</button>
                        {/* 👇 UPDATED TO TRIGGER CSV MODAL */}
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
                        {currentData.map((lead, index) => (
                            <div key={lead.id} className="leads-row leads-grid">
                                <div>{startIndex + index + 1}</div>
                                <div style={{ fontWeight: 600 }}>{lead.name}</div>
                                <div>{lead.email}</div>
                                <div>{lead.source}</div>
                                <div>{lead.date}</div>
                                <div>{lead.location}</div>
                                <div>{lead.language}</div>
                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{lead.assignedTo}</div>
                                <div>{lead.status}</div>
                                <div>{lead.type}</div>
                                <div>{lead.scheduledDate}</div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION AT BOTTOM */}
                    <div className="pagination-wrapper">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredLeads.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>

                {/* --- MODAL COMPONENTS --- */}
                
                {/* 1. Add Manually Modal */}
                <AddLeadManual 
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveManual}
                    leadData={newLead}
                    setLeadData={setNewLead}
                />

                {/* 2. Add CSV Modal */}
                <AddLeadCSV 
                    isOpen={showCSVModal}
                    onClose={() => setShowCSVModal(false)}
                />
            </div>
        </div>
    );
};

export default Leads;