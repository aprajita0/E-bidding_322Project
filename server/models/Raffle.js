const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    raffle_name: { type: String, maxlength: 250, required: true },
    prize: { type: String, maxlength: 250, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
});
  
const Raffle = mongoose.model('Raffle', raffleSchema);
module.exports = Raffle;
