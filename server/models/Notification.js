const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    to_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notification_type: { type: String, required: true },
    read_status: { type: Boolean, default: false },
    subject: { type: String, required: true },
    message: { type: String, required: true } 
  });
  
  const Notification = mongoose.model('Notification', notificationSchema);
  module.exports = Notification;
  