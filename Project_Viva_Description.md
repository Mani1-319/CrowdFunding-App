# Donte - Crowdfunding Platform (Viva Presentation Guide)

This document provides a comprehensive technical overview of the "Donte" crowdfunding platform. It is designed to help you prepare for your viva presentation by detailing the software architecture, technologies, tools, and features implemented in the project.

---

## 1. Project Overview
**Name:** Donte Crowdfunding Platform
**Description:** A full-stack web application designed to connect campaigners with donors. Users can create fundraising campaigns, and donors can securely contribute to these causes using various payment methods. The platform features real-time progress updates, secure authentication, role-based access control, and an intuitive user interface.

---

## 2. Technology Stack

### Frontend (Client-Side)
The frontend is built for performance, responsiveness, and a dynamic user experience.
*   **Core Library:** React 19 (built with Vite for fast bundling and hot module replacement).
*   **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development) & PostCSS.
*   **Routing:** React Router DOM (for navigating between pages like Home, Login, Profile, Campaign Details without reloading).
*   **State Management:** React Context API (used for AuthContext to manage user sessions globally).
*   **Animations:** Framer Motion (for smooth micro-animations and page transitions).
*   **Icons:** Heroicons (for SVG iconography).
*   **Real-time Communication:** Socket.io-client (to listen for live donation updates).
*   **HTTP Client:** Axios (for making REST API requests to the backend).
*   **Toast Notifications:** React Hot Toast (for non-intrusive success/error alerts).

### Backend (Server-Side)
The backend acts as the core engine, handling business logic, database interactions, and API requests.
*   **Runtime Environment:** Node.js.
*   **Framework:** Express.js (for building RESTful APIs and handling routing/middleware).
*   **Real-time Server:** Socket.io (to emit live updates to all connected clients when a donation occurs).
*   **Security & Authentication:** 
    *   **JWT (JSON Web Tokens):** For maintaining stateless, secure user login sessions.
    *   **Bcrypt:** For hashing user passwords before storing them in the database.
*   **File Uploads:** Multer (middleware for handling `multipart/form-data`, primarily used for uploading campaign images).
*   **Email Services:** 
    *   **Nodemailer & Brevo API:** Used for sending Email OTPs during user registration and dispatching "Campaign Success" notification emails.
*   **Payment Gateway:** Razorpay SDK (integrated for secure processing of UPI, Netbanking, and Credit/Debit card payments).

### Database
*   **Database Engine:** PostgreSQL (a powerful, open-source relational database).
*   **Hosting Engine:** Neon DB (a serverless Postgres platform used for hosting the database).
*   **Driver:** `pg` (Node Postgres library used to execute raw SQL queries).
*   **Key Tables/Entities:** 
    *   `users`: Stores donor and campaigner credentials/roles.
    *   `campaigns`: Stores campaign details, goal amount, raised amount, and images.
    *   `donations`: Logs every successful transaction.
    *   `reviews`: Stores user feedback/suggestions for campaigns.

---

## 3. Core Features & Business Logic

1.  **Authentication & Authorization:**
    *   Registration requires Email OTP verification to ensure genuine users.
    *   Role-based access distinguishes between standard users (donors/campaigners) and Admin users (who have moderation capabilities).
2.  **Campaign Management:**
    *   Users can create campaigns with images, titles, descriptions, and goal amounts.
    *   Creators have a dedicated dashboard to view progress and end campaigns when goals are met.
3.  **Secure Payment Processing:**
    *   Donations are processed via **Razorpay**. 
    *   The backend securely verifies the payment signature using `crypto` before updating the database to prevent fraud.
4.  **Real-Time Progress Tracking:**
    *   When a donation is verified, the server emits a `campaign_update` event via **WebSockets (Socket.io)**. 
    *   The frontend instantly updates the progress bar and raised amount without requiring a page refresh.
5.  **Automated Email Notifications:**
    *   When a campaign hits its target goal, an automated email is instantly sent to the creator's registered email ID offering congratulations and detailed stats.
6.  **Dynamic UI Updates:**
    *   Once a campaign is successfully funded, the donation form dynamically transforms into a "Campaign successfully completed" celebration message, preventing over-funding.

---

## 4. Software & Tools Used During Development
*   **IDE (Code Editor):** Visual Studio Code (VS Code).
*   **API Testing:** Postman (for testing backend Express routes, sending mock payloads, and verifying JWT authorization).
*   **Database Management:** Neon Console / pgAdmin (for viewing tables and running SQL commands).
*   **Version Control:** Git & GitHub (for tracking code changes).
*   **Package Managers:** npm (Node Package Manager).

---

## 5. Potential Viva Questions & Answers

*   **Q: Why did you choose PostgreSQL over MongoDB?**
    *   *A: Because a crowdfunding platform requires strict data integrity and relationships (e.g., linking a Donation to a User and a Campaign). Relational databases like Postgres handle structured financial data reliably.*
*   **Q: How does the real-time update work when someone donates?**
    *   *A: We used Socket.io. When the backend successfully verifies a Razorpay payment, it updates the database and immediately pushes an event to all connected clients. The React frontend listens for this event and recalculates the progress bar instantly.*
*   **Q: How are passwords secured?**
    *   *A: Passwords are never stored in plain text. We use the `bcrypt` library to salt and hash passwords before injecting them into the database.*
*   **Q: How does the payment flow work?**
    *   *A: First, the React app calls the backend to create a Razorpay "Order". Once created, Razorpay's UI opens on the frontend. Upon successful payment, Razorpay returns a payment ID and signature. We send this to our backend to verify the cryptographic signature. Only if verified, we mark the donation as successful.*
