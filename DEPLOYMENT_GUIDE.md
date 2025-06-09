# 🚀 FocusFlow Deployment Guide

## Overview
This guide will help you deploy FocusFlow to production using:
- **Frontend**: Vercel (React app)
- **Backend**: Railway (Node.js API)
- **Database**: MongoDB Atlas (Cloud database)

---

## 📋 Prerequisites

1. **GitHub Account** (for code repository)
2. **Vercel Account** (free tier available)
3. **Railway Account** (free tier available)
4. **MongoDB Atlas Account** (free tier available)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "FocusFlow"

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region (closest to your users)
4. Name your cluster "focusflow-cluster"
5. Click "Create Cluster"

### 1.3 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `focusflow-admin`
5. Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `focusflow`

**Example**: `mongodb+srv://focusflow-admin:YOUR_PASSWORD@focusflow-cluster.abc123.mongodb.net/focusflow?retryWrites=true&w=majority`

---

## 🔧 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub account
3. Verify your account

### 2.2 Create New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your FocusFlow repository
5. Choose the `backend` folder as the root directory

### 2.3 Configure Environment Variables
In Railway dashboard, go to your project → Variables tab:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://focusflow-admin:YOUR_PASSWORD@focusflow-cluster.abc123.mongodb.net/focusflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_make_this_very_long_and_random_for_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.vercel.app
CORS_ORIGIN=https://your-app-name.vercel.app
```

### 2.4 Deploy
1. Railway will automatically deploy your backend
2. Wait for deployment to complete
3. Copy your Railway app URL (e.g., `https://focusflow-backend-production.up.railway.app`)

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub account

### 3.2 Import Project
1. Click "New Project"
2. Import your FocusFlow repository
3. Vercel will auto-detect it's a React app
4. Set the root directory to the main folder (not backend)

### 3.3 Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
REACT_APP_APP_NAME=FocusFlow
REACT_APP_VERSION=1.0.0
```

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Your app will be available at `https://your-app-name.vercel.app`

---

## 🔄 Step 4: Update CORS Settings

### 4.1 Update Backend Environment Variables
Go back to Railway and update these variables with your actual Vercel URL:

```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
```

### 4.2 Redeploy Backend
Railway will automatically redeploy with the new environment variables.

---

## ✅ Step 5: Test Deployment

### 5.1 Test Backend
Visit: `https://your-railway-url.up.railway.app/api/health`
Should return: `{"message":"FocusFlow Backend is running!","timestamp":"..."}`

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try registering a new account
3. Create a task
4. Start a pomodoro timer
5. Check if data persists after refresh

---

## 🎉 Deployment Complete!

Your FocusFlow app is now live and accessible worldwide!

### URLs:
- **Frontend**: https://your-app-name.vercel.app
- **Backend**: https://your-backend-name.up.railway.app
- **Database**: MongoDB Atlas cluster

### Next Steps:
1. **Custom Domain** (optional): Add your own domain in Vercel
2. **Monitoring**: Set up error tracking and analytics
3. **Backups**: Configure database backups in MongoDB Atlas
4. **SSL**: Automatically handled by Vercel and Railway

---

## 🆘 Troubleshooting

### Common Issues:

**CORS Errors**:
- Ensure FRONTEND_URL and CORS_ORIGIN match your Vercel URL exactly
- Redeploy backend after updating environment variables

**Database Connection Errors**:
- Check MongoDB Atlas network access allows all IPs
- Verify connection string has correct password and database name

**Build Errors**:
- Check all environment variables are set correctly
- Ensure Node.js version compatibility

**Authentication Issues**:
- Verify JWT_SECRET is set in production
- Check API_URL in frontend environment variables

---

## 📞 Support

If you encounter issues:
1. Check Railway and Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check MongoDB Atlas connection and user permissions
