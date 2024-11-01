const mongoose = require('mongoose');
const { Schema } = mongoose;

const complaintSchema = new Schema({
    complainer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    subject_id: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },    
    description: { type: String, required: true },
    complaint_status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' },
    date_resolved: { type: Date }
  });
  
  const Complaint = mongoose.model('Complaint', complaintSchema);
  module.exports = Complaint;