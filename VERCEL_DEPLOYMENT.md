# 🚀 Vercel Deployment Guide for ArenaWave

## Prerequisites
- ✅ GitHub account with your code pushed
- ✅ Vercel account (free)
- ✅ Domain: www.arenawav.com
- ✅ MongoDB Atlas connection string

## Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended for easy integration)

## Step 2: Import Your Project

1. After logging in, click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Select your repository: `patelvivek9111/arenawave`
4. Click **"Import"**

## Step 3: Configure Project Settings

### Build Settings:
- **Framework Preset**: Other
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install`

### Environment Variables:
Click **"Environment Variables"** and add:

```
MONGODB_URI=mongodb+srv://vp4186522_db_user:binita999@arenawave.xrolljq.mongodb.net/arenawave?retryWrites=true&w=majority
JWT_SECRET=arenawave-secret-key-2024
NODE_ENV=production
PORT=5000
```

⚠️ **Important**: Replace with your actual MongoDB Atlas credentials!

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at: `https://arenawave-xxxxx.vercel.app`

## Step 5: Connect Your Domain

### Add Domain:
1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter: `www.arenawav.com`
4. Click **"Add"**

### Configure DNS:
Vercel will show you DNS records to add. You need to add:

**Option 1: CNAME Record (Recommended)**
- **Type**: CNAME
- **Name**: www
- **Value**: `cname.vercel-dns.com`
- **TTL**: 3600

**Option 2: A Record**
- **Type**: A
- **Name**: @
- **Value**: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
- **TTL**: 3600

### Add Root Domain (Optional):
1. In Vercel, also add: `arenawav.com` (without www)
2. Vercel will provide DNS records for this too

### Update DNS at Your Domain Provider:
1. Log in to your domain registrar (where you bought arenawav.com)
2. Go to DNS settings
3. Add the CNAME or A record as shown in Vercel
4. Wait 24-48 hours for DNS propagation

## Step 6: Verify Deployment

1. Visit: `https://www.arenawav.com`
2. Test the application:
   - ✅ Home page loads
   - ✅ Shop page works
   - ✅ Can create orders
   - ✅ Employee login works
   - ✅ QR scanner works (on mobile)

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### API Not Working:
- Check that MONGODB_URI is set correctly
- Verify MongoDB Atlas allows connections from anywhere (Network Access)
- Check Vercel function logs

### Domain Not Working:
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify domain is added in Vercel dashboard

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Domain connected and verified
- [ ] SSL certificate active (automatic with Vercel)
- [ ] MongoDB Atlas connection working
- [ ] All pages load correctly
- [ ] API endpoints working
- [ ] Mobile camera access works (HTTPS required)

## Free Tier Limits

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Serverless functions

Perfect for your ArenaWave application! 🎉

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Verify environment variables
4. Check browser console for errors

---

**Your site will be live at: https://www.arenawav.com** 🚀

