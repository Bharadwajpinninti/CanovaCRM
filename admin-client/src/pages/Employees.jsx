import React, { useState, useEffect } from 'react';
import './Employees.css';
import Search from '../components/Searchbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';

// --- HELPER ---
const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();

// --- MOCK DATA ---
const generateMockData = () => {
  const data = [];
  const names = ["Tanner Finsha", "Emeto Winner", "Tassy Omah", "James Muriel", "Sarah Connor", "John Doe", "Alice Smith", "Bob Johnson"];
  const statuses = ["Active", "Active", "Inactive", "Inactive", "Inactive", "Active", "Active", "Inactive"];
  
  for (let i = 0; i < 40; i++) {
    const nameIndex = i % names.length;
    const fName = names[nameIndex].split(' ')[0];
    const lName = names[nameIndex].split(' ')[1];
    data.push({
      id: `emp_${i}`,
      mongoId: `#23454GH6J${i}YT6`,
      firstName: fName, 
      lastName: lName,
      email: `${fName.toLowerCase()}@canova.crm`,
      location: "New York", 
      language: "English",
      assigned: Math.floor(Math.random() * 15), 
      closed: Math.floor(Math.random() * 8),
      status: statuses[i % statuses.length]
    });
  }
  return data;
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState({
    firstName: '', lastName: '', email: '', location: '', language: ''
  });

  const ITEMS_PER_PAGE = 8;

  useEffect(() => { 
    setEmployees(generateMockData()); 
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    selectedIds.length === currentData.length ? setSelectedIds([]) : setSelectedIds(currentData.map(e => e.id));
  };
  
  const toggleRow = (id) => {
    selectedIds.includes(id) ? setSelectedIds(selectedIds.filter(sid => sid !== id)) : setSelectedIds([...selectedIds, id]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newEmployee = { 
      ...currentEmployee, 
      id: `new_${Date.now()}`, 
      mongoId: `#${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 
      assigned: 0, closed: 0, status: 'Inactive' 
    };
    setEmployees([newEmployee, ...employees]);
    setShowModal(false);
  };

  const handleDelete = (id) => setEmployees(employees.filter(e => e.id !== id));

  return (
    <div className="emp-container">
      <Search value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />

      <div className="page-content">
        <div className="page-header">
          <Breadcrumbs />
          <div className="btn-group">
            {selectedIds.length > 0 && <button className="btn-delete-bulk">Delete ({selectedIds.length})</button>}
            <button className="btn-add" onClick={() => setShowModal(true)}>Add Employees</button>
          </div>
        </div>

        <div className="emp-card">
          <div className="emp-table-header">
            <div className="th-check"><input type="checkbox" onChange={toggleSelectAll} checked={currentData.length > 0 && selectedIds.length === currentData.length} /></div>
            <div className="th col-name">Name</div>
            <div className="th col-id center-align">Employee ID</div>
            <div className="th col-leads center-align">Assigned Leads</div>
            <div className="th col-leads center-align">Closed Leads</div>
            <div className="th col-status center-align">Status</div>
            <div className="th-menu"></div>
          </div>

          <div className="emp-table-body">
            {currentData.map(emp => (
              <div key={emp.id} className={`emp-row ${selectedIds.includes(emp.id) ? 'selected' : ''}`}>
                <div className="td-check"><input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => toggleRow(emp.id)} /></div>
                <div className="td col-name">
                  <div className="u-wrapper">
                    <div className="u-avatar">{getInitials(emp.firstName, emp.lastName)}</div>
                    <div className="u-details">
                      <span className="u-name">{emp.firstName} {emp.lastName}</span>
                      <span className="u-email">{emp.email}</span>
                    </div>
                  </div>
                </div>
                <div className="td col-id center-align"><span className="badge-id">{emp.mongoId}</span></div>
                <div className="td col-leads center-align">{emp.assigned}</div>
                <div className="td col-leads center-align">{emp.closed}</div>
                <div className="td col-status center-align"><span className={`pill ${emp.status.toLowerCase()}`}><span className="dot"></span> {emp.status}</span></div>
                <div className="td-menu">
                  <button className="icon-btn" onClick={() => setDropdownOpenId(dropdownOpenId === emp.id ? null : emp.id)}>⋮</button>
                  {dropdownOpenId === emp.id && (
                    <div className="menu-dropdown">
                      <div className="menu-item" onClick={() => setDropdownOpenId(null)}>Edit</div>
                      <div className="menu-item delete" onClick={() => { handleDelete(emp.id); setDropdownOpenId(null); }}>Delete</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalItems={filteredEmployees.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* CLEAN AREA MODAL POPUP */}
        {showModal && (
          <div className="modal-area-overlay">
            <div className="clean-popout-box">
              <div className="modal-top">
                <h3 className="modal-title">Add New Employee</h3>
                <button className="btn-close-x" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSave} className="form-stack">
                <div className="input-group-stacked">
                  <label>First name</label>
                  <input placeholder="Sarthak" required value={currentEmployee.firstName} 
                    onChange={e => setCurrentEmployee({...currentEmployee, firstName: e.target.value})} />
                </div>
                <div className="input-group-stacked">
                  <label>Last name</label>
                  <input placeholder="Pal" required value={currentEmployee.lastName} 
                    onChange={e => setCurrentEmployee({...currentEmployee, lastName: e.target.value})} />
                </div>
                <div className="input-group-stacked">
                  <label>Email</label>
                  <input type="email" placeholder="Sarthakpal08@gmail.com" required value={currentEmployee.email} 
                    onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} />
                </div>
                <div className="input-group-stacked">
                  <label>Location</label>
                  <select required value={currentEmployee.location} 
                    onChange={e => setCurrentEmployee({...currentEmployee, location: e.target.value})}>
                    <option value="" disabled>Select Location</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
                <div className="input-group-stacked">
                  <label>Preferred Language</label>
                  <select required value={currentEmployee.language} 
                    onChange={e => setCurrentEmployee({...currentEmployee, language: e.target.value})}>
                    <option value="" disabled>Select Language</option>
                    <option value="Tamil">Tamil</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>
                <div className="modal-action-footer">
                  <button type="submit" className="btn-large-save">Save</button>
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