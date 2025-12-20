const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    businessType: {
        type: String,
        required: true,
        enum: ['grocery', 'restaurant', 'supermarket'],
        default: 'restaurant' // Default for now to avoid breaking existing
    },
    isCommon: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String
    }
}, { timestamps: true });

// Index: unique name per vendor OR unique name for common per business type
// This complex uniqueness is hard to enforce with simple unique index. 
// We will rely on application logic or loose index.
categorySchema.index({ vendorId: 1, name: 1 });
categorySchema.index({ businessType: 1, isCommon: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
