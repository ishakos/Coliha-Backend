# 📦 Coliha Backend

The backend part of the Coliha application.
---

## 🧰 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose ODM
- **JSON Web Tokens (JWT)** for authentication
- **Google Sheets API** (via Google Service Account)
- **node-cron** for scheduled background tasks

---

## 🔐 Features

### ✅ Authentication

- JWT-based authentication with access & refresh tokens.
- Middleware-protected routes.
- Secure user registration, login, and logout flow.
- Token validation and expiration handling.

### 👤 User Management

- Auto-deletion of unverified users after 30 days (via cron job).
- Role-based access control (Admin, Dispatcher, etc.).
- Input validation and error handling middleware.

### 📄 Google Sheets Integration

- Uses a **Google Service Account** to read and write to a Google Sheet.
- Auto-sync orders to the Google Sheet.
- Manipulate rows programmatically based on system activity.

### 🚀 API Endpoints

- RESTful architecture.
- Organized by resource (`/users`, `/auth`, `/orders`, etc.).
- Structured with route-level middleware and controller logic.
- Error handling via centralized middleware.

### 🧹 Cron Jobs

- Scheduled with `node-cron`.
- Daily cleanup of:
  - Expired or inactive unverified users.
  - Optional: old logs, stale tokens, etc.

---

## 📁 Project Structure
├── controllers/
├── middleware/
├── models/
├── routes/
├── scripts/ 
├── config/ 
├── index.js


---

## 🔧 Environment Variables

Create a `.env` file in the root directory and define the following variables:

```env
MONGODB_URI=
SECRET1=
SECRET2=
SECRET3=
SECRET4=
GMAIL=
GMAIL_PASS= must be in this format: xxxx xxxx xxxx xxxx
ADMIN1=
ADMIN_PASS1=
````

---

📦 Installation
-git clone https://github.com/yourusername/Coliha-Backend.git
-cd Coliha-Backend
-npm install

🚀 Usage
-npm start






