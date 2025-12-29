import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Employees.css';
import Search from '../components/Searchbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

// Import Icons
import EditIcon from '../assets/edit.png';
import DeleteIcon from '../assets/delete.png';

const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();

const Employees = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const ITEMS_PER_PAGE = 8;

  // --- STATE ---
  const [loading, setLoading] = useState(true); // 1. Loading State
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', location: '', language: '' });

  // --- 1. FETCH & FILTER ---
  const fetchEmployees = useCallback(async () => {
    try {
      // Ensure spinner shows if re-fetching (optional)
      // setLoading(true); 
      const { data } = await axios.get(`${backendUrl}/api/admin/employees`);
      if (data.success) {
        
        const sortedEmployees = [...data.employees].reverse(); 
        
        setEmployees(sortedEmployees);
        setFilteredEmployees(sortedEmployees);
      }
    } catch (error) { 
        console.error("Error:", error); 
        toast.error("Failed to load employees");
    } finally {
        // 2. IMPORTANT: Stop the spinner when done
        setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = employees.filter(emp => 
      (emp.firstName || "").toLowerCase().includes(lowerTerm) ||
      (emp.lastName || "").toLowerCase().includes(lowerTerm) ||
      (emp.email || "").toLowerCase().includes(lowerTerm)
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees]);

  // --- 2. SELECTION LOGIC ---
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentData.length) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(currentData.map(e => e._id)); 
    }
  };

  const toggleRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- 3. MODAL HANDLERS ---
  const openModal = (employee = null) => {
    setIsEditMode(!!employee);
    setFormData(employee ? { ...employee } : { firstName: '', lastName: '', email: '', location: '', language: '' });
    setShowModal(true);
    setDropdownOpenId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isEditMode ? '/api/admin/edit-employee' : '/api/admin/add-employee';
      const method = isEditMode ? axios.put : axios.post;
      const { data } = await method(`${backendUrl}${endpoint}`, isEditMode ? { ...formData, id: formData._id } : formData);

      if (data.success) {
        toast.success(isEditMode ? "Employee Updated Successfully!" : "Employee Added Successfully!");
        fetchEmployees();
        setShowModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) { alert("Operation failed."); }
  };

  const handleDelete = async (targetId) => {
    const isBulkDelete = selectedIds.includes(targetId) && selectedIds.length > 1;
    const idsToDelete = isBulkDelete ? selectedIds : [targetId];

    const message = isBulkDelete 
      ? `Delete ${idsToDelete.length} selected employees?` 
      : "Delete this employee?";

    if (!window.confirm(message)) return;

    try {
      const payload = isBulkDelete ? { ids: idsToDelete } : { id: targetId };
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-employee`, { data: payload });
      
      if (data.success) {
        toast.success("Employee Deleted Successfully!");
        setSelectedIds([]); 
        fetchEmployees();
      } else {
        toast.error(data.message);
      }
    } catch (error) { console.error(error); }
    setDropdownOpenId(null);
  };

  useEffect(() => {
    const closeMenu = (e) => { if (dropdownOpenId && !e.target.closest('.td-menu')) setDropdownOpenId(null); };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [dropdownOpenId]);

  // --- 4. SPINNER UI (The "Cool" Logic) ---
  if (loading) {
    return (
      <div className="emp-container">
        <div className="page-content">
           <div className="loading-container">
              <div className="spinner"></div>
           </div>
        </div>
      </div>
    );
  }

  // --- 5. MAIN CONTENT ---
  return (
    <div className="emp-container">
      <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      <div className="page-content">
        <div className="page-header">
          <Breadcrumbs />
          <button className="btn-add" onClick={() => openModal()}>Add Employees</button>
        </div>

        <div className="emp-card">
          <div className="emp-table-header">
            <div className="th-check">
              <input 
                type="checkbox" 
                checked={currentData.length > 0 && selectedIds.length === currentData.length}
                onChange={toggleSelectAll} 
              />
            </div>
            <div className="th col-name">Name</div>
            <div className="th col-id center-align">Employee ID</div>
            <div className="th col-leads center-align">Assigned Leads</div>
            <div className="th col-leads center-align">Closed Leads</div>
            <div className="th col-status center-align">Status</div>
            <div className="th-menu"></div>
          </div>

          <div className="emp-table-body">
            {currentData.map(emp => (
              <div key={emp._id} className={`emp-row ${selectedIds.includes(emp._id) ? 'selected' : ''}`}>
                <div className="td-check">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(emp._id)}
                    onChange={() => toggleRow(emp._id)}
                  />
                </div>
                <div className="td col-name">
                  <div className="u-wrapper">
                    <div className="u-avatar">{getInitials(emp.firstName, emp.lastName)}</div>
                    <div className="u-details">
                      <span className="u-name">{emp.firstName} {emp.lastName}</span>
                      <span className="u-email">{emp.email}</span>
                    </div>
                  </div>
                </div>
                <div className="td col-id center-align"><span className="badge-id">{emp.employeeId}</span></div>
                <div className="td col-leads center-align">{emp.assigned}</div>
                <div className="td col-leads center-align">{emp.closed}</div>
                <div className="td col-status center-align">
                  <span className={`pill ${emp.status ? emp.status.toLowerCase() : 'active'}`}><span className="dot"></span> {emp.status}</span>
                </div>
                <div className="td-menu">
                  <button className="icon-btn" onClick={() => setDropdownOpenId(dropdownOpenId === emp._id ? null : emp._id)}>⋮</button>
                  {dropdownOpenId === emp._id && (
                    <div className="menu-dropdown">
                      <div className="menu-item" onClick={() => openModal(emp)}>
                        <img src={EditIcon} alt="Edit" /> Edit
                      </div>
                      <div className="menu-item" onClick={() => handleDelete(emp._id)}>
                        <img src={DeleteIcon} alt="Delete" /> Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalItems={filteredEmployees.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
        </div>

        {showModal && (
          <div className="modal-area-overlay">
            <div className="clean-popout-box">
              <div className="modal-top">
                <h3 className="modal-title">{isEditMode ? "Edit Employee" : "Add New Employee"}</h3>
                <button className="btn-close-x" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave} className="form-stack">
                <div className="input-group-stacked">
                  <label>First name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div className="input-group-stacked">
                  <label>Last name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="input-group-stacked">
                  <label>Email {isEditMode && <small>(Not Editable)</small>}</label>
                  <input type="email" required value={formData.email} disabled={isEditMode} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="input-group-stacked">
                  <label>Location</label>
                  <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="input-group-stacked">
                  <label>Preferred Language {isEditMode && <small>(Not Editable)</small>}</label>
                  <input required value={formData.language} disabled={isEditMode} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                </div>
                <div className="modal-action-footer">
                  <button type="submit" className="btn-large-save">{isEditMode ? "Update" : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;