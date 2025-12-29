// import mongoose from 'mongoose';

// const leadSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   source: { type: String, required: true },
//   date: { type: String, required: true }, // Or Date type if you prefer
//   location: { type: String, required: true },
//   language: { type: String, required: true },
  
//   // System Fields
//   status: { type: String, default: "ongoing" }, // ongoing, closed
//   type: { type: String, default: "-" },
//   scheduleDate: { type: String, default: "-" },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null }
// }, { timestamps: true });

// const Lead = mongoose.model('Lead', leadSchema);
// export default Lead;

import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  source: { type: String, required: true },
  date: { type: String, required: true }, 
  location: { type: String, required: true },
  language: { type: String, required: true },
  
  // System Fields
  status: { type: String, default: "ongoing" },
  type: { type: String, default: "-" },
  scheduleDate: { type: String, default: "-" },

  // 👇 THIS IS THE CRITICAL LINE FOR POPULATE TO WORK 👇
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', // This must match the model name in Employee.js
    default: null 
  } 

}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;