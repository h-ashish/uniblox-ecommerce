# Uniblox E-commerce Store

A full-stack e-commerce application with a discount reward system built with React and Node.js.

## 🎯 Features

- **Product Catalog**: Browse and view available products
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout System**: Complete purchase with optional discount codes
- **Discount Rewards**: Every nth order automatically receives a discount code
- **Admin Dashboard**: View statistics including revenue, discount codes, and sales data
- **Stock Management**: Real-time stock tracking and validation

## 🏗️ Architecture

### Backend (Node.js + Express)

- RESTful API with clear endpoint design
- Service layer architecture (CartService, OrderService, DiscountService)
- In-memory data store (easily replaceable with database)
- Comprehensive error handling and validation
- Unit tests with Jest

### Frontend (React)

- Modern React with Hooks
- Responsive UI design
- Real-time cart updates
- Admin statistics modal
- User-friendly error messages

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

To verify your installations:

```bash
node --version
npm --version
```

## 🚀 Getting Started

### 1. Clone or Download the Repository

```bash
git clone <your-repo-url>
cd uniblox-ecommerce
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:

- express (web framework)
- cors (cross-origin resource sharing)
- uuid (unique ID generation)
- jest (testing framework)
- supertest (API testing)
- nodemon (development server)

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:

- react (UI library)
- react-dom (React DOM rendering)
- react-scripts (Create React App scripts)

### 4. Start the Backend Server

```bash
cd ../backend
npm start
```

The backend server will start on **http://localhost:3000**

You should see:

```
Server running on http://localhost:3000
Discount system: Every 3rd order gets 10% off
```

### 5. Start the Frontend Application

Open a **new terminal window** and run:

```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:5173** and automatically open in your browser.

## 🧪 Running Tests

The project includes comprehensive unit tests for all core business logic.

### Run All Tests

```bash
cd backend
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

This will show:

- Test results for all services
- Code coverage metrics
- Detailed coverage report in `coverage/` directory

### Test Files

- `discountService.test.js` - Discount code generation and validation
- `cartService.test.js` - Cart operations and validation
- `orderService.test.js` - Checkout process and order management

## 📡 API Documentation

### Product Endpoints

#### Get All Products

```
GET /api/products
```

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "id": "1",
      "name": "Laptop",
      "price": 1000,
      "stock": 10
    }
  ]
}
```

#### Get Product by ID

```
GET /api/products/:id
```

### Cart Endpoints

#### Add Item to Cart

```
POST /api/cart/add
Content-Type: application/json

{
  "userId": "user-123",
  "productId": "1",
  "quantity": 2
}
```

#### Get Cart

```
GET /api/cart/:userId
```

#### Update Cart Item

```
PUT /api/cart/update
Content-Type: application/json

{
  "userId": "user-123",
  "productId": "1",
  "quantity": 5
}
```

#### Remove Item from Cart

```
DELETE /api/cart/remove
Content-Type: application/json

{
  "userId": "user-123",
  "productId": "1"
}
```

### Checkout Endpoint

```
POST /api/checkout
Content-Type: application/json

{
  "userId": "user-123",
  "discountCode": "DISC-ABC123"  // optional
}
```

**Response (with new discount code):**

```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "userId": "user-123",
    "items": [...],
    "subtotal": 2000,
    "discount": 200,
    "finalAmount": 1800,
    "discountCode": "DISC-ABC123",
    "discountPercentage": 10
  },
  "message": "Order placed successfully",
  "newDiscountCode": {
    "code": "DISC-XYZ789",
    "discountPercentage": 10,
    "message": "Congratulations! You've earned a 10% discount code for your next purchase!"
  }
}
```

### Admin Endpoints

#### Generate Discount Code

```
POST /api/admin/generate-discount
Content-Type: application/json

{
  "orderNumber": 3
}
```

#### Get Statistics

```
GET /api/admin/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalItemsPurchased": 150,
    "totalRevenue": 12500.5,
    "discountCodes": {
      "total": 10,
      "used": 7,
      "unused": 3
    },
    "totalDiscountGiven": 1250.05,
    "totalOrders": 25
  }
}
```

#### Get All Discount Codes

```
GET /api/admin/discount-codes
```

#### Get All Orders

```
GET /api/admin/orders
```

## 🎮 How to Use the Application

### As a Customer:

1. **Browse Products**: View all available products on the home page
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click the "Cart" button in the header
4. **Update Quantities**: Use +/- buttons to adjust quantities
5. **Apply Discount**: Enter a discount code (if you have one)
6. **Checkout**: Click "Checkout" to complete your purchase
7. **Receive Reward**: Every 3rd order earns you a discount code for 10% off your next purchase!

### As an Admin:

1. **View Statistics**: Click "View Stats" button to see:
   - Total orders placed
   - Total items purchased
   - Total revenue
   - Discount codes (total, used, unused)
   - Total discount amount given

## 🔧 Configuration

### Discount System Configuration

The discount system can be configured in `backend/dataStore.js`:

```javascript
this.config = {
  nthOrder: 3, // Every 3rd order gets a discount
  discountPercentage: 10, // 10% discount
};
```

### Product Catalog

Initial products are defined in `backend/dataStore.js`:

```javascript
this.products = new Map([
  ["1", { id: "1", name: "Laptop", price: 1000, stock: 10 }],
  ["2", { id: "2", name: "Mouse", price: 25, stock: 50 }],
  // Add more products here
]);
```

## 📁 Project Structure

```
uniblox-ecommerce/
├── backend/
│   ├── cartService.js           # Cart business logic
│   ├── orderService.js          # Order and checkout logic
│   ├── discountService.js       # Discount code logic
│   ├── dataStore.js             # In-memory data storage
│   ├── server.js                # Express server and routes
│   ├── *.test.js                # Unit tests
│   ├── jest.config.js           # Jest configuration
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── App.css              # Styles
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   └── package.json             # Frontend dependencies
│
├── DECISIONS.md                 # Design decisions documentation
└── README.md                    # This file
```

## 🧠 Design Decisions

For detailed explanations of architectural and implementation decisions, please see [DECISIONS.md](./DECISIONS.md).

Key decisions include:

- In-memory data store with singleton pattern
- Service layer architecture
- Automatic discount code generation
- Comprehensive validation strategy
- RESTful API design
- React hooks for state management
- Stock management during checkout
- Error handling strategy
- Testing approach

## 🧪 Testing Approach

The project uses Jest for unit testing with a focus on:

1. **Core Business Logic**: All services have comprehensive tests
2. **Success Scenarios**: Happy path testing for all operations
3. **Error Handling**: Testing validation and error cases
4. **Edge Cases**: Boundary conditions and unusual inputs
5. **Integration**: Service interaction testing

**Test Coverage Areas:**

- Discount code generation (nth order logic)
- Discount code validation (invalid, used, valid)
- Discount application calculation
- Cart operations (add, update, remove)
- Stock validation
- Checkout process
- Order creation and tracking

## 🚨 Known Limitations

1. **In-Memory Storage**: Data is lost when server restarts
2. **No Authentication**: Simple user ID system (not production-ready)
3. **Race Conditions**: Concurrent checkouts may cause stock issues
4. **No Persistence**: Orders and discount codes are not saved
5. **Single Instance**: Cannot scale horizontally without shared storage

## 🔜 Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication and authorization
- Payment gateway integration
- Order history page
- Email notifications
- Discount code expiration
- Product search and filtering
- Pagination for large product lists
- Inventory management system
- Admin panel for product management

## 📄 License

This project is created for the Uniblox assignment.

## 🤝 Contributing

This is an assignment project. For any questions or issues, please contact the developer.

## 📞 Support

If you encounter any issues:

1. Make sure Node.js and npm are installed correctly
2. Check that ports 3000 and 5173 are available
3. Verify all dependencies are installed (`npm install`)
4. Check the console for error messages
5. Ensure you're running commands from the correct directory

## 📝 Notes

- The backend runs on port 3000
- The frontend runs on port 5173
- All data is stored in memory and will reset on server restart
- Every 3rd order automatically receives a 10% discount code
- Discount codes can only be used once
- Stock is validated at checkout to prevent overselling
