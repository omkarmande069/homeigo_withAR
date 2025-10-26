# HomeGo - MongoDB Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB

#### Option A: Local MongoDB
1. Install MongoDB on your machine: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Create `.env` file in project root:
```env
MONGODB_URI=mongodb://localhost:27017/homego
PORT=3000
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Create `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/homego
PORT=3000
```

### 3. Start the Backend Server
```bash
npm run server
```

The API server will run on http://localhost:3000

### 4. Start the Frontend (in a new terminal)
```bash
npm run dev
```

The frontend will run on http://localhost:5173 (Vite default)

## MongoDB Collections

The system automatically creates these collections:
- `sellers` - Seller accounts and information
- `products` - Product listings
- `orders` - Customer orders
- `transactions` - Payment transactions
- `promotions` - Discount codes and promotions
- `supportTickets` - Customer and seller support tickets
- `content` - CMS content (banners, featured categories)

## API Endpoints

### Sellers
- GET `/api/sellers` - Get all sellers
- GET `/api/sellers/:id` - Get seller by ID
- POST `/api/sellers` - Create new seller
- PATCH `/api/sellers/:id/status` - Update seller status

### Products
- GET `/api/products` - Get all products (supports filters: ?sellerId=xxx&category=xxx)
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Orders
- GET `/api/orders` - Get all orders (supports filters: ?sellerId=xxx&customerId=xxx)
- POST `/api/orders` - Create new order
- PATCH `/api/orders/:id/status` - Update order status

### Transactions
- GET `/api/transactions` - Get all transactions
- POST `/api/transactions` - Create transaction

### Promotions
- GET `/api/promotions` - Get all promotions
- POST `/api/promotions` - Create promotion
- DELETE `/api/promotions/:id` - Delete promotion

### Support Tickets
- GET `/api/support-tickets` - Get all tickets (filters: ?userEmail=xxx&userType=xxx&status=xxx)
- GET `/api/support-tickets/:id` - Get ticket by ID
- POST `/api/support-tickets` - Create ticket
- PATCH `/api/support-tickets/:id/status` - Update ticket status
- POST `/api/support-tickets/:id/responses` - Add admin response

### Statistics
- GET `/api/stats/seller/:sellerId` - Get seller statistics
- GET `/api/stats/admin` - Get admin dashboard statistics

### Content Management
- GET `/api/content/:key` - Get content by key
- PUT `/api/content/:key` - Update content

## Accessing the Dashboards

1. **Customer Support**: Navigate to `http://localhost:5173/customer-support.html`
2. **Seller Dashboard**: Navigate to `http://localhost:5173/seller.html`
3. **Admin Dashboard**: Navigate to `http://localhost:5173/admin.html`

All pages now fetch data from MongoDB via the API!

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### CORS Errors
- Make sure backend server is running on port 3000
- Check that CORS is enabled in `server.js`

### Data Not Showing
- Check browser console for API errors
- Verify backend server logs
- Test API endpoints directly: `http://localhost:3000/api/sellers`
