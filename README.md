# ArenaWave - E-commerce Platform

A complete e-commerce web application for selling FM Radio Earwings. Built with React frontend, Node.js/Express backend, and MongoDB database.

**🌐 Live Website:** https://www.arenawav.com

---

## 🚀 Features

### Customer Features
- **Home Page**: Modern landing page with product showcase and features
- **Shop Page**: Product details with quantity selector (max 10 units)
- **Shopping Cart**: Add items, manage quantities, and view totals
- **Checkout Process**: Secure customer information collection
- **Order Confirmation**: QR code generation and email delivery
- **Responsive Design**: Fully optimized for mobile and desktop

### Employee Features
- **Secure Login**: JWT-based authentication system
- **QR Code Scanner**: Real-time webcam-based QR code scanning
- **Order Search**: Search orders by order ID, customer name, email, or phone
- **Order Details View**: Complete order information with customer contact details
- **Order Status Management**: Update status (Pending → Processing → Fulfilled → Cancelled)
- **Notes & Comments**: Add internal or customer-visible notes to orders
- **Issue Tracking**: Flag orders with issues and track problem resolution
- **Customer Order History**: View all past orders for a customer with statistics
- **Quick Actions**: 
  - Email customer directly
  - Call customer
  - Resend order confirmation email
  - Generate printable order summary (PDF)

### Admin Features
- **Dashboard Overview**: Statistics cards (Orders, Revenue, Pending, Fulfilled, Customers)
- **Orders Management**: View, search, and filter all orders
- **Customers Management**: View customer list and order history
- **Employees Management**: View and manage employee accounts
- **Analytics**: Revenue tracking and order statistics

### Technical Features
- **QR Code System**: Unique QR codes per order with email delivery
- **Email Notifications**: Order confirmations with embedded QR codes
- **Real-time Status Updates**: Order status tracking with history
- **Mobile-Optimized UI**: Touch-friendly interface with responsive design
- **Secure Authentication**: JWT tokens with role-based access control
- **RESTful API**: Well-structured API endpoints
- **Database Management**: MongoDB with Mongoose ODM

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **jsQR** - QR code scanning library
- **React Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Nodemailer** - Email service
- **QRCode** - QR code generation

---

## 📁 Project Structure

```
ArenaWave/
├── api/                          # Vercel serverless functions
│   ├── index.js                  # Main API handler
│   └── manifest.js              # Manifest.json handler
│
├── client/                       # React frontend application
│   ├── build/                    # Production build (generated)
│   ├── public/                   # Static assets
│   │   ├── Earwing.png          # Product image
│   │   ├── index.html           # HTML template
│   │   └── manifest.json        # PWA manifest
│   │
│   ├── src/                      # Source code
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.js       # Navigation bar
│   │   │   └── qrScanner/      # QR Scanner components
│   │   │       ├── AddNoteModal.js
│   │   │       ├── CustomerHistoryModal.js
│   │   │       ├── IssueFlagModal.js
│   │   │       ├── OrderDetailsView.js
│   │   │       ├── QRScannerView.js
│   │   │       ├── SearchOrdersTab.js
│   │   │       └── StatusUpdateModal.js
│   │   │
│   │   ├── config/              # Configuration files
│   │   │   └── api.js           # API base URL config
│   │   │
│   │   ├── context/             # React Context
│   │   │   └── CartContext.js   # Shopping cart state
│   │   │
│   │   ├── pages/               # Page components
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── Shop.js          # Product page
│   │   │   ├── Cart.js          # Shopping cart
│   │   │   ├── Checkout.js      # Checkout form
│   │   │   ├── Confirmation.js  # Order confirmation
│   │   │   ├── EmployeeLogin.js # Employee login
│   │   │   ├── QRScanner.js     # QR scanner & order management
│   │   │   ├── AdminDashboard.js # Admin overview
│   │   │   ├── AdminOrders.js   # Admin orders page
│   │   │   ├── AdminCustomers.js # Admin customers page
│   │   │   └── AdminEmployees.js # Admin employees page
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   └── qrScannerUtils.js # QR scanner utilities
│   │   │
│   │   ├── App.js               # Main app component
│   │   ├── index.js              # React entry point
│   │   └── index.css            # Global styles
│   │
│   ├── package.json             # Frontend dependencies
│   ├── tailwind.config.js       # Tailwind configuration
│   └── postcss.config.js        # PostCSS configuration
│
├── models/                       # Database models
│   └── Order.js                 # Order schema
│
├── routes/                       # API routes
│   ├── admin.js                 # Admin & employee endpoints
│   ├── auth.js                  # Authentication routes
│   └── orders.js                # Order management routes
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Backend dependencies
├── server.js                    # Express server (local dev)
├── vercel.json                  # Vercel configuration
└── README.md                    # This file
```

---

## 🔌 API Endpoints

### Order Management
- `POST /api/order/create` - Create new order
- `POST /api/order/fulfill` - Check order by QR code
- `PUT /api/order/fulfill/:orderId` - Mark order as fulfilled
- `GET /api/order/status/:orderId` - Get order status

### Authentication
- `POST /api/auth/login` - Employee/Admin login
- `GET /api/auth/verify` - Verify JWT token

### Admin & Employee Endpoints
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders (with filters)
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/employee/search` - Search orders/customers
- `GET /api/admin/employee/order/:orderId` - Get order details
- `PUT /api/admin/employee/order/:orderId/status` - Update order status
- `POST /api/admin/employee/order/:orderId/notes` - Add note to order
- `PUT /api/admin/employee/order/:orderId/issue` - Flag/unflag order issue
- `GET /api/admin/employee/customer/:email/orders` - Get customer order history
- `POST /api/admin/employee/order/:orderId/resend-email` - Resend confirmation email
- `GET /api/admin/employee/order/:orderId/summary` - Get order summary for PDF

---

## 💾 Database Schema

### Order Model
```javascript
{
  order_id: String (unique, required),
  customer_name: String (required),
  email: String (required),
  phone: String (required),
  quantity: Number (required, min: 1, max: 10),
  total_price: Number (required),
  qr_code: String (unique),
  status: String (enum: 'Pending', 'Processing', 'Fulfilled', 'Cancelled'),
  created_at: Date,
  fulfilled_at: Date,
  fulfilled_by: String,
  cancelled_at: Date,
  cancelled_by: String,
  has_issue: Boolean (default: false),
  issue_description: String,
  notes: [{
    note: String,
    added_by: String,
    added_at: Date,
    is_internal: Boolean
  }],
  status_history: [{
    status: String,
    changed_by: String,
    changed_at: Date,
    note: String
  }]
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/patelvivek9111/arenawave.git
   cd ArenaWave
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/arenawave
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arenawave
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running
   - Cloud: Use MongoDB Atlas (recommended)

5. **Run the application**
   ```bash
   # Start backend server (with nodemon)
   npm run dev
   
   # In a new terminal, start frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📱 Usage Flow

### Customer Journey
1. Visit home page and browse product
2. Navigate to shop page
3. Select quantity (1-10 units)
4. Add to cart
5. Review cart and proceed to checkout
6. Fill in customer information (name, email, phone)
7. Place order and receive confirmation
8. Receive email with QR code
9. Present QR code for collection

### Employee Journey
1. Login with employee credentials
2. Access QR scanner page
3. **Option A - Scan QR Code:**
   - Start camera
   - Scan customer's QR code
   - View order details
   - Update status, add notes, or flag issues
   - Mark as fulfilled
4. **Option B - Search Orders:**
   - Switch to "Search Orders" tab
   - Search by order ID, name, email, or phone
   - View order details
   - Manage order status and notes
5. View customer order history
6. Use quick actions (email, call, resend email, print summary)

### Admin Journey
1. Login with admin credentials
2. View dashboard with statistics
3. Navigate to Orders, Customers, or Employees pages
4. Search and filter data
5. View detailed information
6. Manage system data

---

## 🔐 Authentication

### Roles
- **Employee**: Can scan QR codes, search orders, manage order status
- **Admin**: Full access including dashboard, orders, customers, and employees management

### Default Test Accounts
⚠️ **Remove these in production!**
- **Employee**: `employee1` / `password123`
- **Admin**: `admin1` / `password123`

---

## 🎨 Key Features Explained

### QR Code System
- Each order generates a unique QR code
- QR codes contain order ID in JSON format
- Sent to customers via email
- Employees scan QR codes to access order details
- Status changes are tracked in history

### Order Status Workflow
1. **Pending** - Order placed, awaiting fulfillment
2. **Processing** - Order being prepared
3. **Fulfilled** - Order completed and delivered
4. **Cancelled** - Order cancelled (with reason)

### Issue Tracking
- Flag orders with problems
- Add issue descriptions
- Track resolution
- Internal notes for team communication

### Customer Order History
- View all orders for a customer
- Statistics: total orders, total spent, average order value
- Status breakdown
- Click any order to view details

---

## 📦 Available Scripts

### Root Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start React development server
- `npm run vercel-build` - Build for Vercel deployment

### Client Directory
- `npm start` - Start React dev server
- `npm run build` - Build for production
- `npm test` - Run tests

---

## 🌐 Deployment

### Vercel Deployment (Current)
- Frontend and backend deployed on Vercel
- Serverless functions for API routes
- Automatic SSL certificates
- Custom domain: `arenawav.com`

### Environment Variables (Production)
Set these in Vercel dashboard:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

---

## 🔒 Security Notes

- JWT tokens stored in localStorage
- Password hashing (implement bcrypt in production)
- CORS configured for API access
- Environment variables for sensitive data
- Role-based access control (RBAC)

⚠️ **For Production:**
- Implement proper password hashing
- Add rate limiting
- Enable HTTPS only
- Add input validation and sanitization
- Implement CSRF protection
- Add logging and monitoring

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for ArenaWave**
