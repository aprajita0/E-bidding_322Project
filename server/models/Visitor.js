const mongoose = require('mongoose');
const { Schema } = mongoose;

const visitorSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    CAPTCHA_question: { type: Boolean, default: false },
    application_status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] }
  });
  
  const Visitor = mongoose.model('Visitor', visitorSchema);
  module.exports = Visitor;
  