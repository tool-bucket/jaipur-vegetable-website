# FreshJaipur Backend

This backend receives customer orders centrally and stores them in MongoDB.

## 1. Install Node.js
Install Node.js LTS on your computer.

## 2. Install dependencies
Open terminal inside `backend`:
```bash
npm install
```

## 3. Create `.env`
Copy `.env.example` to `.env` and fill:
- MONGODB_URI
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- FRONTEND_URL

## 4. Start backend
```bash
npm run dev
```
API runs on:
`http://localhost:5000`

Test:
`http://localhost:5000/api/health`

## 5. Admin dashboard
Open:
`http://localhost:5000/admin/`

Login using ADMIN_EMAIL and ADMIN_PASSWORD from `.env`.

## 6. Frontend
For local testing, `js/api-config.js` already points to:
`http://localhost:5000/api`

For production, replace it with your deployed backend URL, for example:
`https://YOUR-BACKEND-DOMAIN/api`

## Important
Never commit `.env` to GitHub. It contains your database password and admin credentials.

For production, deploy the backend on a Node.js hosting service and MongoDB on MongoDB Atlas (or another managed MongoDB service).
