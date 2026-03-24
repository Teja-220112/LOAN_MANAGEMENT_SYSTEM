require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@loansphere.com';

        // Check if admin already exists
        let adminUser = await User.findOne({ email: adminEmail });
        
        if (adminUser) {
            console.log('Admin user already exists:', adminEmail);
        } else {
            console.log('Creating admin user...');
            adminUser = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: 'admin123',
                role: 'admin',
                phone: '0000000000',
                national_id: 'ADMIN001'
            });
            console.log('Admin user created successfully!');
        }
        
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        mongoose.disconnect();
        process.exit();
    }
};

createAdmin();
