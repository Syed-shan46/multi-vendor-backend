const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    fcmToken: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: 'Zepcart User'
    },
    email: {
        type: String,
        sparse: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    addresses: [{
        type: {
            type: String,
            enum: ['Home', 'Work'],
            required: true
        },
        houseNo: { type: String, required: true },
        area: { type: String, required: true },
        description: { type: String },
        receiverName: { type: String, required: true },
        receiverPhone: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
