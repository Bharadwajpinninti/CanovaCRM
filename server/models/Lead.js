import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  source: { type: String },
  date: { type: Date, default: Date.now }, 
  location: { type: String },
  language: { type: String, required: true }, 
  
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    default: null 
  },
  
  status: { 
    type: String, 
    enum: ['Ongoing', 'Closed'], 
    default: 'Ongoing' 
  },
  
  type: { 
    type: String, 
    enum: ['Hot', 'Warm', 'Cold'], 
    default: 'Hot' 
  },
  
  scheduledDate: { type: Date, default: null },

}, { timestamps: true });

LeadSchema.index({ language: 1, assignedTo: 1, status: 1 });

// Check if model exists before compiling
const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export default Lead;