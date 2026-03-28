# Donte - Donation-Based Crowdfunding Platform

A full-stack, production-ready web application for a modern Crowdfunding platform. Features secure JWT authentication, real-time donation progress via WebSockets, and secure Razorpay payment integration for UPI/Card donations.

## Prerequisites

Ensure you have the following installed on your local machine:
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (Local or Neon DB) - [Download](https://www.postgresql.org/)

## Local Setup Instructions

Follow these step-by-step instructions to run the application locally.

### 1. Database Setup

1. Open your PostgreSQL interactive terminal (`psql`) or a DB manager like pgAdmin/DBeaver.
2. Create a new database:
   ```sql
   CREATE DATABASE donte_db;
   ```
3. Run the schema creation script located at `server/config/schema.sql` against your new database to create all required tables. (e.g. `\i server/config/schema.sql`).

### 2. Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy the `.env.example` file and rename it to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your actual credentials. Most importantly, set the `DATABASE_URL` to point to your PostgreSQL instance:
     ```
     DATABASE_URL=postgres://postgres:your_password@localhost:5432/donte_db
     JWT_SECRET=your_random_secret_string
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   node index.js
   ```
   *The server will run on `http://localhost:5000`.*

### 3. Frontend Setup

1. Open a new terminal window and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```bash
   echo VITE_RAZORPAY_KEY_ID=your_razorpay_key_id > .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client will run on `http://localhost:5173`.*

## Automated Startup (Windows)

We've provided a batch script `start.bat` in the root directory. To quickly start both servers:
1. Ensure your `.env` files are configured and DB is set up.
2. Double-click `start.bat` or run it from the terminal.

## Features Included
- **User Authentication**: Secure JWT, BCrypt password hashing, and Email OTP verification.
- **Admin Authentication**: Separate portal to manage/remove fraudulent campaigns.
- **Real-Time Donations**: Live updates to the donation bar via Socket.io when any user donates.
- **Secure Payments**: Razorpay integrated for UPI, Credit, and Debit cards.
- **Email Notifications**: Summaries emailed to campaign creators upon campaign completion.
- **Secure Reviews**: Private reviews/suggestions visible only to the campaign creator and admin.
