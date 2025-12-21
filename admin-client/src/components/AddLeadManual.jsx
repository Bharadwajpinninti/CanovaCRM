import React from 'react';
import './AddLeadManual.css';

const AddLeadManual = ({ isOpen, onClose, onSave, leadData, setLeadData }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-area-overlay">
            <div className="clean-popout-box add-lead-box">
                <div className="modal-top">
                    <h3 className="modal-title">Add New Lead</h3>
                    <button className="btn-close-x" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={onSave} className="form-stack">
                    <div className="input-group-stacked">
                        <label>Name</label>
                        <input 
                            placeholder="" 
                            required 
                            value={leadData.name} 
                            onChange={e => setLeadData({...leadData, name: e.target.value})} 
                        />
                    </div>

                    <div className="input-group-stacked">
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="" 
                            required 
                            value={leadData.email} 
                            onChange={e => setLeadData({...leadData, email: e.target.value})} 
                        />
                    </div>

                    <div className="input-group-stacked">
                        <label>Source</label>
                        <input 
                            placeholder="" 
                            required 
                            value={leadData.source} 
                            onChange={e => setLeadData({...leadData, source: e.target.value})} 
                        />
                    </div>

                    <div className="input-group-stacked">
                        <label>Date</label>
                        <input 
                            type="text"
                            placeholder="" 
                            required 
                            value={leadData.date} 
                            onChange={e => setLeadData({...leadData, date: e.target.value})} 
                        />
                    </div>

                    <div className="input-group-stacked">
                        <label>Location</label>
                        <input 
                            placeholder="" 
                            required 
                            value={leadData.location} 
                            onChange={e => setLeadData({...leadData, location: e.target.value})} 
                        />
                    </div>

                    <div className="input-group-stacked">
                        <label>Preferred Language</label>
                        {/* CHANGED: select dropdown removed and replaced with text input */}
                        <input 
                            placeholder=""
                            required
                            value={leadData.language} 
                            onChange={e => setLeadData({...leadData, language: e.target.value})}
                        />
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