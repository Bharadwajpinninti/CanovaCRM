import React, { useState, useRef } from 'react';
import './AddLeadCSV.css';
import uploadIcon from '../assets/upload-icon.png';
import downloadIcon from '../assets/download-icon.png';
import nextArrow from '../assets/next-arrow.png';

const AddLeadCSV = ({ isOpen, onClose }) => {
    // 1. State to track the filename
    const [fileName, setFileName] = useState("Sample File.csv");
    // 2. Reference to the hidden file input
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    // 3. Trigger the hidden input
    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    // 4. Update name when file is selected
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <div className="modal-area-overlay">
            <div className="csv-upload-box">
                <div className="csv-header">
                    <div className="csv-title-group">
                        <h3 className="csv-title">CSV Upload</h3>
                        <p className="csv-subtitle">Add your documents here</p>
                    </div>
                    <button className="btn-close-x" onClick={onClose}>✕</button>
                </div>

                <div className="drop-zone">
                    <div className="upload-icon-container">
                        <img src={uploadIcon} alt="Upload" className="upload-main-img" />
                    </div>
                    <p className="drop-text">Drag your file(s) to start uploading</p>
                    <div className="or-divider">
                        <span className="line"></span>
                        <span className="or-text">OR</span>
                        <span className="line"></span>
                    </div>

                    {/* HIDDEN FILE INPUT - Restricts to .csv */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".csv" 
                        onChange={handleFileChange}
                    />
                    
                    <button className="btn-browse" onClick={handleBrowseClick}>Browse files</button>

                    <div className="sample-file-container">
                        {/* Display the state variable instead of hardcoded text */}
                        <span className="sample-text">{fileName}</span>
                        <button className="btn-download-sample">
                            <img src={downloadIcon} alt="Download" className="download-icon-img" />
                        </button>
                    </div>
                </div>

                <div className="csv-footer">
                    <button className="btn-csv-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-csv-next">
                        Next 
                        <img src={nextArrow} alt="Next" className="btn-next-img" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddLeadCSV;