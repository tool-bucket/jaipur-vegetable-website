# FreshJaipur — Final Production Setup

The code is complete, but two external services must be connected from your own accounts because they require private credentials:

1. MongoDB Atlas — database
2. A Node.js host (Render/Railway/etc.) — backend server

## MongoDB
Create a MongoDB Atlas cluster and database, then copy the connection string into `MONGODB_URI`.

Use a database user with a strong password. Do not publish this string.

## Backend deployment
This project includes `render.yaml`.

On your Node hosting service:
- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`

Set these environment variables:
- MONGODB_URI
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- FRONTEND_URL=https://www.freshjaipur.site

After deployment you will get an API URL such as:
`https://your-backend-host.example`

## Connect the website
Edit the root frontend file:
`js/api-config.js`

Change:
`window.FRESHJAIPUR_API_URL = "http://localhost:5000/api";`

to:
`window.FRESHJAIPUR_API_URL = "https://YOUR-BACKEND-DOMAIN/api";`

Then upload the website again.

## Admin
Open:
`https://YOUR-BACKEND-DOMAIN/admin/`

Use the ADMIN_EMAIL and ADMIN_PASSWORD you configured.

## Order flow
Customer -> checkout -> backend `/api/orders` -> MongoDB -> admin dashboard.

WhatsApp is optional and is not required for receiving orders.
