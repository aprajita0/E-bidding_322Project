const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
 //We don't need to specify the _id field because MongoDB automatically creates it.
    username: { type: String, required: true, maxlength: 50 },
    password: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, maxlength: 100 },
    address_line_1: { type: String, maxlength: 100 },
    address_line_2: { type: String, maxlength: 100 },
    role_id: { type: Schema.Types.ObjectId, ref: 'Role' },
    account_balance: { type: mongoose.Types.Decimal128, default: 0.00 },
    suspension_count: { type: Number, default: 0 },
    account_status: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);
