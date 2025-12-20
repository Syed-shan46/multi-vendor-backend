require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
const VendorProfile = require('./src/models/VendorProfile');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
};

const debugVendors = async () => {
    await connectDB();

    try {
        const vendors = await Vendor.find({});
        console.log(`Found ${vendors.length} vendors in total.`);

        for (const v of vendors) {
            const profile = await VendorProfile.findOne({ vendorId: v._id });
            const isApproved = v.status === 'approved';
            const hasProfile = !!profile;

            console.log('--------------------------------------------------');
            console.log(`Vendor ID: ${v._id}`);
            console.log(`Details: Type=${v.businessType}, Status=${v.status}`);
            console.log(`Profile Exists: ${hasProfile}`);
            if (profile) {
                console.log(`Profile Name: ${profile.businessName}`);
            }

            if (isApproved && hasProfile) {
                console.log('=> VISIBLE in Customer App');
            } else {
                console.log('=> HIDDEN in Customer App');
                if (!isApproved) console.log('   Reason: Status is not approved');
                if (!hasProfile) console.log('   Reason: Missing VendorProfile');
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

debugVendors();
