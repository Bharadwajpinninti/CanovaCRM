import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  role: { type: String, default: 'Sales' },
  
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Inactive' 
  },
  
  location: { type: String, required: true },
  language: { type: String, required: true }, 
  
  // Logic: 3 leads per cycle
  currentLeadCount: { type: Number, default: 0 }, 
  
  // Logic: Max 1 break per day
  dailyBreakTaken: { type: Boolean, default: false },
  
  // Stats
  totalAssignedLeads: { type: Number, default: 0 },
  totalClosedLeads: { type: Number, default: 0 },

  attendanceLogs: [{
    date: { type: Date, default: Date.now },
    checkInTime: Date,
    checkOutTime: Date,
    breaks: [{ startTime: Date, endTime: Date }]
  }]
}, { timestamps: true });

// Check if model exists before compiling
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

export default Employee;