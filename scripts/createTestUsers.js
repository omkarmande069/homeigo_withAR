const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/homeigo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createTestUser() {
    try {
        // Delete existing user if any
        await User.deleteOne({ email: 'rutu@gmail.com' });

        // Create new user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            name: 'Rutu',
            email: 'rutu@gmail.com',
            password: hashedPassword,
            role: 'customer'
        });

        await user.save();
        console.log('Test user created successfully');

        // Create a test seller
        await User.deleteOne({ email: 'seller@test.com' });
        const seller = new User({
            name: 'Test Seller',
            email: 'seller@test.com',
            password: hashedPassword,
            role: 'seller'
        });
        await seller.save();
        console.log('Test seller created successfully');

        // Create a test admin
        await User.deleteOne({ email: 'admin@homeigo.com' });
        const admin = new User({
            name: 'Admin',
            email: 'admin@homeigo.com',
            password: hashedPassword,
            role: 'admin'
        });
        await admin.save();
        console.log('Test admin created successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestUser();