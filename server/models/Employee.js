// import mongoose from 'mongoose';

// const EmployeeSchema = new mongoose.Schema({
//   // 1. Updated to match Frontend Form
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
  
//   // 2. Added Employee ID (Generated in Controller)
//   employeeId: { type: String, required: true, unique: true },

//   email: { type: String, required: true, unique: true }, 
//   role: { type: String, default: 'Sales' },
  
//   status: { 
//     type: String, 
//     enum: ['Active', 'Inactive'], 
//     default: 'Active' // Changed default to Active so they show up as working immediately
//   },
  
//   location: { type: String, default: "New York" },
//   language: { type: String, default: "English" }, 
  
//   // Logic: 3 leads per cycle
//   currentLeadCount: { type: Number, default: 0 }, 
  
//   // Logic: Max 1 break per day
//   dailyBreakTaken: { type: Boolean, default: false },
  
//   // Stats
//   assigned: { type: Number, default: 0 }, // Renamed from totalAssignedLeads to match Frontend map
//   closed: { type: Number, default: 0 },   // Renamed from totalClosedLeads to match Frontend map

//   attendanceLogs: [{
//     date: { type: Date, default: Date.now },
//     checkInTime: Date,
//     checkOutTime: Date,
//     breaks: [{ startTime: Date, endTime: Date }]
//   }]
// }, { timestamps: true });

// // Check if model exists before compiling
// const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

// export default Employee;


import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  // --- EXISTING FIELDS (Untouched) ---
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, 
  role: { type: String, default: 'Sales' },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  },
  location: { type: String, default: "New York" },
  language: { type: String, default: "English" }, 
  currentLeadCount: { type: Number, default: 0 }, 
  dailyBreakTaken: { type: Boolean, default: false },
  assigned: { type: Number, default: 0 },
  closed: { type: Number, default: 0 },

  // --- NEW FIELDS FOR PERMANENT DASHBOARD STATE ---
  // null = Grey, true = Green, false = Red
  checkInStatus: { type: Boolean, default: null }, 
  breakStatus: { type: Boolean, default: null },
  
  // To show times on the dashboard
  lastCheckInTime: { type: String, default: null }, 
  lastCheckOutTime: { type: String, default: null },
  
  // To store the list of breaks shown in your UI
  breakHistory: [{
    break: String, // Start Time
    ended: String, // End Time
    date: String
  }],

  // Keeping your original logs array for deep history if needed
  attendanceLogs: [{
    date: { type: Date, default: Date.now },
    checkInTime: Date,
    checkOutTime: Date,
    breaks: [{ startTime: Date, endTime: Date }]
  }]
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
export default Employee;