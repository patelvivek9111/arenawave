# Vercel Setup Instructions - After Removing vercel.json

## Important: Update Vercel Project Settings

Since we removed `vercel.json`, you need to configure Vercel through the dashboard:

### Step 1: Go to Vercel Dashboard
1. Open your project: `patelvivek9111/arenawave`
2. Click **"Settings"** tab
3. Click **"General"** in the left sidebar

### Step 2: Configure Build Settings

Scroll to **"Build and Development Settings"**:

- **Framework Preset**: `Other` or `Create React App`
- **Root Directory**: `./` (leave as root)
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install`

### Step 3: API Routes Configuration

Vercel will automatically detect the `api/` folder and create serverless functions.

The `api/index.js` file will handle all `/api/*` routes.

### Step 4: Environment Variables

Make sure these are set in **Settings → Environment Variables**:

```
MONGODB_URI=mongodb+srv://vp4186522_db_user:binita999@arenawave.xrolljq.mongodb.net/arenawave?retryWrites=true&w=majority
JWT_SECRET=arenawave-secret-key-2024
NODE_ENV=production
```

### Step 5: Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

## Alternative: If This Doesn't Work

If Vercel still can't find the files, we may need to:
1. Move `client/` contents to root level
2. Or use a different deployment platform
3. Or create a custom build script

Let me know if you need help with any of these steps!

