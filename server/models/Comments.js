const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    listing_id: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    commenter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, maxlength: 500 },
    date_added: { type: Date, default: Date.now }
  });
  
  const Comment = mongoose.model('Comment', commentSchema);
  module.exports = Comment;
  