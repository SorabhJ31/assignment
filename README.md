# Invoice Generator API

## Prerequisites
- Node.js (>=14.x)
- MongoDB

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory with the following:
   ```env
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_secret_key
   ```

4. Run the application:
   ```bash
   npx nodemon app.js
   ```

## API Endpoints
- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login user
- **POST /api/products**: Add products and generate invoice (JWT token required)

