# Artistic Gallery

A modern gallery application with admin panel for managing content.

## Features

- Responsive gallery with image and video support
- Admin panel for content management
- Authentication system for admin access
- PostgreSQL database for data storage
- Modern UI with animations and glass morphism design

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js, express-session

## Deployment on Railway

### Prerequisites

- [Railway](https://railway.app/) account
- Git repository with your project code
- [Railway CLI](https://docs.railway.app/develop/cli) (optional for local development)

### Step-by-Step Deployment Guide

1. **Login to Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Sign in with your account

2. **Create a New Project**
   - Click on "New Project" button
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select the repository containing your Artistic Gallery project
   - Click "Deploy Now"

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" and then "PostgreSQL"
   - Wait for the database to be provisioned

4. **Configure Environment Variables**
   - Go to your web service's "Variables" tab
   - Railway will automatically provide `DATABASE_URL` from your PostgreSQL service
   - Add the following additional variables:
     ```
     SESSION_SECRET=your-strong-session-secret-here
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=securepassword
     NODE_ENV=production
     ```

5. **Generate Domain**
   - Go to your web service's "Settings" tab
   - Under "Networking", click "Generate Domain"
   - Your application will be available at the generated URL

6. **Verify Deployment**
   - Check the deployment logs to ensure everything is running correctly
   - Visit the generated domain URL
   - Test the admin login functionality at `/login`

### Troubleshooting Railway Deployment

- **Database Connection Issues**: 
  - Verify that your `DATABASE_URL` is correctly set in Railway variables
  - Check that your service can access the PostgreSQL database

- **Build Failures**: 
  - Check the build logs for errors
  - Ensure all dependencies are correctly specified in package.json
  - Verify that your railway.json file is properly configured

- **Runtime Errors**: 
  - Check the deployment logs for any runtime errors
  - Ensure your application is properly configured to run in a production environment

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Access the application at `http://localhost:8080`

### Using Railway CLI for Local Development

To use Railway's environment variables locally:

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login to Railway: `railway login`
3. Link to your project: `railway link`
4. Run with Railway variables: `railway run npm run dev`

## Database Schema

The application uses a PostgreSQL database with the following schema:

- **Gallery Items**: Stores all gallery content including images, videos, and metadata

## Authentication

The admin panel is protected with authentication:

- Login at `/login` with your admin credentials
- Admin routes are protected with authentication middleware
- Session data is stored in the PostgreSQL database