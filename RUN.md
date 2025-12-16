# RUN.md

This document provides step-by-step instructions to set up and run the Real-time Dashboard system.

---

## Prerequisites

Ensure the following are installed on your system:

- Node.js v18 or above
- npm v9 or above

---

## Repository Setup

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/Rudra212545/Real-time-Dashboard.git
cd Real-time-Dashboard
```
---
## Backend Setup

The backend handles real-time orchestration, agent logic, and security primitives.

Navigate to the backend directory:

```bash
cd backend
```

Create the environment configuration file:
```bash
cp .env.example .env
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm start
``` 

Backend runs at:

 * http://localhost:3000

---
## Frontend Setup

The frontend provides the real-time dashboard UI.

Open a new terminal window while keeping the backend server running.

Navigate to the frontend directory:

```bash
cd frontend
```
Install dependencies:

```bash
npm install
```
Start the frontend development server:

```bash
npm run dev
``` 

Frontend runs at:

* http://localhost:5173

---
## System Usage

    1. Open the frontend URL in a browser.

    2. Multiple users can connect simultaneously using multiple tabs or browsers.

    3. Trigger actions such as click, inspect, and idle.

    4. Observe agent decisions, logs, security indicators, and queue activity in real time.
--- 
## Common Issues

* Port already in use:
         Stop existing Node.js processes or update the port configuration.

* Socket connection issues: 
         Ensure the backend server is running before starting the frontend.
* JWT or security errors: 
         Verify all required values are correctly set in the .env file.