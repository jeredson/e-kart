# E-Kart - Vercel Deployment Guide

## Automatic Deployment (No Tokens Required)

### Connect GitHub to Vercel
1. Push your code to GitHub: `https://github.com/jeredson/e-kart`
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Click "Import Git Repository"
5. Select your GitHub repository: `jeredson/e-kart`
6. Vercel will automatically:
   - Detect it's a Vite React project
   - Set build command to `npm run build`
   - Set output directory to `dist`
   - Deploy immediately

### Automatic Deployments
Once connected:
- **Production**: Every push to `main` branch auto-deploys
- **Preview**: Every push to other branches creates preview URLs
- **Pull Requests**: Automatic preview deployments

### Environment Variables
Add your Supabase variables in Vercel:
1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Environment Variables
If your app uses environment variables, add them in:
- Vercel Dashboard → Project Settings → Environment Variables
- Or via CLI: `vercel env add`

### Build Configuration
The project is configured with:
- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Custom Domain
After deployment, you can add a custom domain in:
Project Settings → Domains → Add Domain

### Automatic Deployments
- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches and pull requests

## Project Structure
This is a React + TypeScript + Vite project with:
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Backend**: Supabase
- **Routing**: React Router DOM

## Local Development
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080`