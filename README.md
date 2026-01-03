# ArenaWave - FM Radio Earwing E-commerce Platform

A complete e-commerce web application for selling FM Radio Earwings used in IPL matches. Built with React frontend, Node.js/Express backend, and MongoDB database.

## Features

### Customer Features
- **Home Page**: Clean landing page with product showcase
- **Shop Page**: Product details with quantity selector
- **Cart Management**: Add items and manage quantities
- **Checkout Process**: Customer information collection
- **Order Confirmation**: QR code generation and email delivery
- **Responsive Design**: Modern UI with Tailwind CSS

### Employee Features
- **Employee Login**: Secure authentication system
- **QR Code Scanner**: Webcam-based QR code scanning
- **Order Fulfillment**: Mark orders as fulfilled
- **Order Status Tracking**: Real-time order status updates

### Technical Features
- **QR Code Generation**: Unique QR codes per order
- **Email Notifications**: Order confirmations with QR codes
- **Database Management**: MongoDB with Mongoose ODM
- **API Integration**: RESTful API endpoints
- **Authentication**: JWT-based employee authentication

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- HTML5 QR Code Scanner

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer
- QRCode library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/arenawave
   JWT_SECRET=arenawave-secret-key-2024
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Start backend server
   npm run dev
   
   # In a new terminal, start frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Order Management
- `POST /api/order/create` - Create new order
- `POST /api/order/fulfill` - Check order by QR code
- `PUT /api/order/fulfill/:orderId` - Mark order as fulfilled
- `GET /api/order/status/:orderId` - Get order status

### Authentication
- `POST /api/auth/login` - Employee login
- `GET /api/auth/verify` - Verify JWT token

## Database Schema

### Orders Collection
```javascript
{
  order_id: String (unique),
  customer_name: String,
  email: String,
  phone: String,
  quantity: Number,
  qr_code: String (unique),
  status: String (enum: 'Pending', 'Fulfilled'),
  total_price: Number,
  created_at: Date
}
```

## Employee Credentials

### Test Accounts
- **Employee**: `employee1` / `password123`
- **Admin**: `admin1` / `password123`

## Usage Flow

### Customer Journey
1. Visit the home page
2. Navigate to shop page
3. Select quantity and add to cart
4. Proceed to checkout
5. Fill in customer information
6. Place order and receive QR code
7. Present QR code for collection

### Employee Journey
1. Login with employee credentials
2. Access QR scanner page
3. Scan customer's QR code
4. View order details
5. Mark order as fulfilled
6. Hand over products to customer

## QR Code System

- Each order generates a unique QR code
- QR codes contain order ID and type information
- Employees scan QR codes to access order details
- Once fulfilled, QR codes cannot be reused
- QR codes are sent via email to customers

## Email System

- Uses Nodemailer with dummy SMTP (Ethereal Email)
- Sends order confirmation emails with QR codes
- Includes order details and collection instructions

## Development

### Project Structure
```
ArenaWave/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # API routes
├── server.js              # Express server
└── package.json
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start React development server
- `npm run build` - Build React app for production
- `npm run install-all` - Install all dependencies

## Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to hosting platform (Heroku, Vercel, etc.)
4. Set up production environment variables

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to hosting platform
3. Configure API endpoint URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**Note**: This is a demo application. For production use, implement proper security measures, payment gateways, and error handling.
