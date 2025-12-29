import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AddLeadCSV.css';

import FolderIcon from '../assets/upload-icon.png'; 
import DownloadIcon from '../assets/download-icon.png'; 

const AddLeadCSV = ({ isOpen, onClose, onLeadAdded }) => { 
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    // UI State
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false); 

    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setStep(1);
        setFile(null);
        setProgress(0);
        setIsUploading(false);
    };

     
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "text/csv") {
            setFile(selected);
        } else {
            toast.error("Please select a valid CSV file");
        }
    };

   
    const handleNext = () => {
        if (!file) return;
        setStep(2);
        simulateVerification();
    };

  
    const simulateVerification = () => {
        setProgress(0);
        let current = 0;
        const interval = setInterval(() => {
            current += Math.floor(Math.random() * 10) + 5;
            
            if (current >= 100) {
                current = 100;
                setProgress(100);
                clearInterval(interval);
            } else {
                setProgress(current);
            }
        }, 200);
    };

   
    const handleUploadClick = () => {
        if (!file || isUploading) return;
        
        setIsUploading(true);
        const loadingToast = toast.loading("Uploading leads...");

       
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const csvText = e.target.result;

            try {
                // B. Send to Backend
                const { data } = await axios.post(`${backendUrl}/api/leads/add-csv`, {
                    csvData: csvText
                });

                toast.dismiss(loadingToast);

                if (data.success) {
                    toast.success(`Success! Added ${data.count} leads.`);
                    if (onLeadAdded) onLeadAdded(); // Refresh the table in parent component
                    onClose(); 
                } else {
                    toast.error(data.message || "Upload failed");
                    setIsUploading(false);
                }
            } catch (error) {
                console.error("Upload Error:", error);
                toast.dismiss(loadingToast);
                toast.error("Server Error. Please try again.");
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file");
            setIsUploading(false);
        };

        // Trigger the read
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                {/* HEADER */}
                <div className="modal-header">
                    <h3>CSV Upload</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <p className="modal-subtitle">Add your documents here</p>

                {/* --- CONTENT AREA --- */}
                <div className="upload-area">
                    
                    {step === 1 ? (
                        /* STATE 1: SELECTION UI */
                        <div className="drop-content">
                            <img src={FolderIcon} alt="folder" className="upload-icon-img" />
                            <p className="drag-text">Drag your file(s) to start uploading</p>
                            <div className="or-divider">OR</div>
                            
                            <input 
                                type="file" 
                                id="csvInput" 
                                accept=".csv" 
                                onChange={handleFileChange} 
                                hidden 
                            />
                            <label htmlFor="csvInput" className="browse-btn">
                                {file ? "Change File" : "Browse files"}
                            </label>

                            {file ? (
                                <div className="sample-file-row" style={{borderColor: '#4caf50'}}>
                                    <span className="sample-text" style={{color: 'grey', fontWeight: 'bold'}}>
                                        {file.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="sample-file-row">
                                    <span className="sample-text">Sample File.csv</span>
                                    <button style={{border:'none', background:'none', cursor:'pointer'}}>
                                        <img src={DownloadIcon} alt="Download" style={{width:'16px'}} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STATE 2: VERIFYING UI */
                        <div className="processing-content">
                            <div className="spinner-ring" style={{
                                background: `conic-gradient(#111 ${progress}%, #e0e0e0 0)`
                            }}>
                                <div className="spinner-center">{progress}%</div>
                            </div>
                            
                            <p className="verifying-text">Verifying...</p>
                            
                            <button className="inner-cancel-btn" onClick={() => setStep(1)}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* --- FOOTER BUTTONS --- */}
                <div className="modal-footer">
                    <button className="btn-footer-cancel" onClick={onClose}>Cancel</button>
                    
                    {step === 1 ? (
                        <button 
                            className="btn-footer-action" 
                            onClick={handleNext}
                            disabled={!file}
                        >
                            Next &gt;
                        </button>
                    ) : (
                        <button 
                            className="btn-footer-action" 
                            onClick={handleUploadClick}
                            disabled={progress < 100 || isUploading}
                            style={{ opacity: (progress < 100 || isUploading) ? 0.5 : 1 }}
                        >
                            {isUploading ? "Uploading..." : "Upload"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddLeadCSV;