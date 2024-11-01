const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
    rater_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transaction_id: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    rating: { type: Number, required: true }
  });
  
  const Rating = mongoose.model('Rating', ratingSchema);
  module.exports = Rating;
  