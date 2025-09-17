const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB Connection URL
const MONGODB_URI = 'mongodb+srv://omkar:omkar@ghar.qbuckf8.mongodb.net/?retryWrites=true&w=majority&appName=Ghar';

// Sample products data
const products = [
    {
        name: 'Modern Sectional Sofa',
        price: 1299,
        category: 'sofas',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: true,
        description: 'A luxurious modern sectional sofa perfect for contemporary living rooms.'
    },
    {
        name: 'Minimalist Coffee Table',
        price: 399,
        category: 'tables',
        rating: 4.6,
        image: 'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: true,
        description: 'Sleek and minimalist coffee table with clean lines and durable construction.'
    },
    {
        name: 'Queen Platform Bed',
        price: 899,
        category: 'bedroom',
        rating: 4.9,
        image: 'https://images.pexels.com/photos/6480198/pexels-photo-6480198.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Modern queen-size platform bed with built-in storage.'
    },
    {
        name: 'Arc Floor Lamp',
        price: 189,
        category: 'lighting',
        rating: 4.7,
        image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: true,
        description: 'Elegant arc floor lamp with adjustable height and direction.'
    },
    {
        name: 'Dining Table Set',
        price: 799,
        category: 'tables',
        rating: 4.5,
        image: 'https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Complete dining set with table and 6 chairs.'
    },
    {
        name: 'Accent Chair',
        price: 449,
        category: 'chairs',
        rating: 4.4,
        image: 'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Stylish accent chair perfect for any room.'
    },
    {
        name: 'Modern Bookshelf',
        price: 299,
        category: 'storage',
        rating: 4.3,
        image: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Contemporary bookshelf with adjustable shelves.'
    },
    {
        name: 'Executive Office Chair',
        price: 549,
        category: 'chairs',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: true,
        description: 'Ergonomic office chair with lumbar support and adjustable features.'
    },
    {
        name: 'Rustic TV Stand',
        price: 379,
        category: 'storage',
        rating: 4.6,
        image: 'https://images.pexels.com/photos/4846461/pexels-photo-4846461.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Rustic TV stand with plenty of storage space.'
    },
    {
        name: 'Modern Nightstand',
        price: 149,
        category: 'bedroom',
        rating: 4.5,
        image: 'https://images.pexels.com/photos/6588592/pexels-photo-6588592.jpeg?auto=compress&cs=tinysrgb&w=300&h=250&dpr=1',
        featured: false,
        description: 'Contemporary nightstand with drawer and open shelf.'
    }
];

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const insertedProducts = await Product.insertMany(products);
        console.log(`Successfully inserted ${insertedProducts.length} products`);

        // Display inserted products
        console.log('\nInserted Products:');
        insertedProducts.forEach(product => {
            console.log(`- ${product.name} ($${product.price})`);
        });

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log('Database connection closed');
    }
})
.catch(error => {
    console.error('MongoDB connection error:', error);
});
