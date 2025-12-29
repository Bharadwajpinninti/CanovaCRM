import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import './AddLeadManual.css';
import toast from 'react-hot-toast';

const AddLeadManual = ({ isOpen, onClose, onLeadAdded }) => { // Changed onSave to onLeadAdded
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    const [leadData, setLeadData] = useState({
        name: '', email: '', source: '', date: '', location: '', language: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        
        // 1. Create a COPY of the data so we don't affect the form UI
        const payload = { ...leadData };

      
        if (payload.date) {
            payload.date = payload.date.split('-').reverse().join('-');
        }

        try {
            // UPDATED URL HERE: Sending 'payload' instead of raw 'leadData'
            const { data } = await axios.post(`${backendUrl}/api/leads/add-manually`, payload);

            if (data.success) {
                toast.success(data.message);
                if (onLeadAdded) onLeadAdded();
                onClose();
                setLeadData({ name: '', email: '', source: '', date: '', location: '', language: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error adding lead", error);
            toast.error("Failed to add lead");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-area-overlay">
            <div className="clean-popout-box add-lead-box">
                <div className="modal-top">
                    <h3 className="modal-title">Add New Lead</h3>
                    <button className="btn-close-x" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSave} className="form-stack">
                    <div className="input-group-stacked">
                        <label>Name</label>
                        <input required value={leadData.name} onChange={e => setLeadData({ ...leadData, name: e.target.value })} />
                    </div>

                    <div className="input-group-stacked">
                        <label>Email</label>
                        <input type="email" required value={leadData.email} onChange={e => setLeadData({ ...leadData, email: e.target.value })} />
                    </div>

                    <div className="input-group-stacked">
                        <label>Source</label>
                        <input required value={leadData.source} onChange={e => setLeadData({ ...leadData, source: e.target.value })} />
                    </div>

                    <div className="input-group-stacked">
                        <label>Date</label>
                        <input type="date" required value={leadData.date} onChange={e => setLeadData({ ...leadData, date: e.target.value })} />
                    </div>

                    <div className="input-group-stacked">
                        <label>Location</label>
                        <input required value={leadData.location} onChange={e => setLeadData({ ...leadData, location: e.target.value })} />
                    </div>

                    <div className="input-group-stacked">
                        <label>Preferred Language</label>
                        <input required value={leadData.language} onChange={e => setLeadData({ ...leadData, language: e.target.value })} />
                    </div>

                    <div className="modal-action-footer">
                        <button type="submit" className="btn-large-save">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLeadManual;