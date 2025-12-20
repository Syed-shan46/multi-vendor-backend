const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./src/middlewares/error.middleware');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const userAuthRoutes = require('./src/routes/userAuth.routes');
const userProfileRoutes = require('./src/routes/userProfile.routes');
const vendorRoutes = require('./src/routes/vendor.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const groceryRoutes = require('./src/routes/grocery.routes');
const restaurantRoutes = require('./src/routes/restaurant.routes');
const supermarketRoutes = require('./src/routes/supermarket.routes');
const orderRoutes = require('./src/routes/order.routes');
const adminRoutes = require('./src/routes/admin.routes');
const categoryRoutes = require('./src/routes/category.routes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Route Mounting
app.use('/api/auth', authRoutes);
const customerRoutes = require('./src/routes/customer.routes');

// ...

app.use('/api/user/auth', userAuthRoutes); // User specific auth
app.use('/api/user/profile', userProfileRoutes); // User Profile
app.use('/api/customer', customerRoutes); // Browsing Products/Vendors
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor', settingsRoutes); // Mounts /api/vendor/settings
app.use('/api/grocery', groceryRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/supermarket', supermarketRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/category', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler
app.use(errorHandler);

module.exports = app;
