const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://omkar:omkar@ghar.qbuckf8.mongodb.net/';

// Sample user data
const sampleUsers = [
    {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
        },
        billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
        },
        phoneNumber: '+1234567890',
        isVerified: true
    },
    {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        role: 'user',
        shippingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
        },
        billingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
        },
        phoneNumber: '+1987654321',
        isVerified: true
    },
    {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        shippingAddress: {
            street: '789 Admin St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
        },
        billingAddress: {
            street: '789 Admin St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
        },
        phoneNumber: '+1555555555',
        isVerified: true
    }
];

// Function to seed users
async function seedUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Insert sample users
        const createdUsers = await User.create(sampleUsers);
        console.log(`Created ${createdUsers.length} sample users`);

        // Log the created users (without passwords)
        createdUsers.forEach(user => {
            console.log(`Created user: ${user.fullName} (${user.email}) - Role: ${user.role}`);
        });

        console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedUsers();
