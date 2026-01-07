# Deployment Guide

## Deploying to Vercel

### Prerequisites

1. **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/settings/keys)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Code must be pushed to GitHub

### Step 1: Create Vercel Blob Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Blob** storage
5. Name it `paper-simplifier-storage`
6. Note down the connection details

### Step 2: Deploy to Vercel

1. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Environment Variables**:

   Add these environment variables in Vercel project settings:

   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your-token-here
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Where to get values:**
   - `ANTHROPIC_API_KEY`: From [Anthropic Console](https://console.anthropic.com/settings/keys)
   - `BLOB_READ_WRITE_TOKEN`: Auto-generated when you connect Blob storage to your project
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL

3. **Connect Blob Storage**:
   - In Vercel project settings → Storage
   - Connect the Blob store you created earlier
   - This will automatically add `BLOB_READ_WRITE_TOKEN`

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Step 3: Verify Deployment

1. Visit your deployment URL
2. Test uploading a paper or using a URL
3. Check that:
   - Papers process successfully
   - Diagrams render correctly
   - Dark/light theme works
   - Share links work

### Important Notes

#### Function Timeout

The `/api/process` route has a 5-minute timeout:
```typescript
export const maxDuration = 300; // 5 minutes
```

**This requires Vercel Pro plan** (Hobby plan limited to 10 seconds).

**Options:**
1. **Upgrade to Pro**: $20/month for longer function timeouts
2. **Keep Hobby + Reduce timeout**: Change to `maxDuration = 10` but papers may timeout
3. **Use background jobs**: Implement queue system (more complex)

#### Storage Limits

**Vercel Blob Free Tier:**
- 1 GB total storage
- 100 GB bandwidth/month

Each processed paper is ~50-200 KB. You can store ~5,000-20,000 papers on free tier.

#### Cost Estimates

**Monthly costs (assuming moderate usage):**
- Vercel Hobby (free): $0
- Anthropic API: $5-20 (depends on paper volume)
- **Total**: $5-20/month

**With Vercel Pro** (for longer timeouts):
- Vercel Pro: $20/month
- Anthropic API: $5-20/month
- **Total**: $25-40/month

### Troubleshooting

#### "Paper processing timed out"

**Cause**: Function timeout (10s on Hobby plan)

**Solutions:**
1. Upgrade to Vercel Pro for 300s timeout
2. Reduce `maxDuration` to 10 and process shorter papers
3. Split processing into multiple API calls

#### "Failed to save paper"

**Cause**: Missing `BLOB_READ_WRITE_TOKEN`

**Solution:**
1. Go to Vercel Dashboard → Your Project → Storage
2. Connect Blob storage
3. Verify `BLOB_READ_WRITE_TOKEN` is set in environment variables
4. Redeploy

#### "Diagrams not rendering"

**Cause**: Mermaid client-side rendering issue

**Solution:**
1. Clear browser cache
2. Check browser console for errors
3. Verify `mermaid` package is in dependencies (not devDependencies)

#### "API key not found"

**Cause**: `ANTHROPIC_API_KEY` not set

**Solution:**
1. Add API key in Vercel Dashboard → Settings → Environment Variables
2. Redeploy project

### Alternative: Deploy to Other Platforms

#### Railway.app
- Similar to Vercel
- Use filesystem storage instead of Blob
- No function timeout limits

#### AWS/GCP
- More complex setup
- Use S3 or Cloud Storage for papers
- Deploy as containerized app

## Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

Local storage uses filesystem (`/data/papers/`) instead of Vercel Blob.
