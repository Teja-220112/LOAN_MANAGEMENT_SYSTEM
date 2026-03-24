# LoanSphere Management System

A full-stack Loan Management System built with Node.js, Express, MongoDB Atlas, and Vanilla Javascript/HTML.

## Features
- User Registration & Authentication
- Loan Application Workflow
- Admin Panel for Loan Review and Approvals
- Payment Processing and EMI Schedules
- Analytics and Reporting

## Project Structure
- `/backend`: Node.js/Express server logic and API routes.
- `/frontend`: Responsive UI using HTML, CSS, and Vanilla JS.

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB Atlas Cluster

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd LOAN_MANAGEMENT_SYSTEM
   ```

2. **Setup Backend**:
   - Go to the `backend` directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file from the example:
     ```bash
     cp .env.example .env
     ```
   - **Important**: Open your `.env` and add your **MongoDB Atlas URI**. It should look like this:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.2bcl6to.mongodb.net/loansphere?appName=Cluster0
     PORT=3000
     JWT_SECRET=your_jwt_secret_key
     ```

3. **Run the Application**:
   - Start the backend:
     ```bash
     npm start
     ```
   - Open `/frontend/index.html` in your browser.

## Security Note
**Never commit your `.env` file or your real database credentials to public repositories.** The `.gitignore` file includes it automatically to keep your secrets safe.
