# Quick Setup Guide

This guide will help you get the Shopify Analytics System up and running quickly.

## Prerequisites

- Node.js 20 or higher
- A Supabase account (free tier works)
- A Shopify Partner account
- Docker (optional, for containerized deployment)

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Get your database connection string:
   - Go to Project Settings > Database
   - Copy the "Connection string" under "Connection pooling"
   - Use "Transaction" mode for the connection pooler

3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the "Project URL" (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the "anon/public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

4. The database schema has already been applied to your Supabase instance using migrations.

## Step 2: Shopify App Setup

1. Go to [partners.shopify.com](https://partners.shopify.com)

2. Create a new app:
   - Click "Apps" in the sidebar
   - Click "Create app"
   - Choose "Custom app"
   - Name your app

3. Configure API access:
   - Go to "Configuration" tab
   - Under "Admin API access scopes", select:
     - `read_products`
     - `read_orders`
     - `read_customers`
     - `read_inventory`
   - Click "Save"

4. Install the app on a development store:
   - Go to "Test your app" section
   - Select a development store
   - Click "Install app"

5. Get your API credentials:
   - Go to "API credentials" tab
   - Copy the "API key" and "API secret key"
   - After installation, you'll get an "Admin API access token"

## Step 3: Project Setup

1. Clone and install:
```bash
git clone <your-repo-url>
cd shopify-analytics-system
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Fill in your `.env` file:
```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase (from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Shopify (from Shopify Partner Dashboard)
SHOPIFY_API_KEY="your-api-key"
SHOPIFY_API_SECRET="your-api-secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_SECRET_KEY="generate-a-random-secret-key"
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Verify database connection:
```bash
npx prisma studio
```
This opens a browser interface to view your database tables.

## Step 4: Run the Application

### Development Mode

1. Start the Next.js app:
```bash
npm run dev
```

2. In a separate terminal, start the scheduler:
```bash
npm run scheduler
```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Run the scheduler:
```bash
npm run scheduler
```

### Docker Deployment

1. Build and start all services:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop services:
```bash
docker-compose down
```

## Step 5: Add Your First Store

1. Open the app in your browser
2. Click "Add Store"
3. Fill in the form:
   - **Store Name**: A friendly name (e.g., "My Dev Store")
   - **Shop Domain**: Your Shopify store domain (e.g., "my-store.myshopify.com")
   - **Access Token**: The Admin API access token from Shopify
4. Click "Add Store"

## Step 6: Sync Data

1. Click the "Sync" button on your store card
2. Wait for the sync to complete (this may take a few minutes for large stores)
3. Once complete, click "Analytics" to view your dashboard

## Step 7: Set Up Webhooks (Optional)

For real-time updates, configure Shopify webhooks:

1. In your Shopify Partner Dashboard, go to your app
2. Go to "Configuration" > "Webhooks"
3. Add the following webhooks pointing to `https://your-domain.com/api/webhooks/shopify`:
   - `products/create`
   - `products/update`
   - `orders/create`
   - `orders/updated`
   - `customers/create`
   - `customers/update`

4. Make sure your app is publicly accessible (use ngrok for local development):
```bash
ngrok http 3000
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Check that your `DATABASE_URL` is correct
2. Ensure you're using the connection pooler URL (contains `pooler.supabase.com`)
3. Verify the `?pgbouncer=true` parameter is in the URL
4. Check that your Supabase project is active

### Shopify API Errors

If syncing fails:

1. Verify your access token is valid
2. Check that all required scopes are granted
3. Ensure the shop domain is correct (format: `store.myshopify.com`)
4. Check Shopify API rate limits

### Build Errors

If the build fails:

1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Run `npx prisma generate`
4. Try building again: `npm run build`

## Next Steps

- Set up automated syncs using the scheduler
- Configure webhooks for real-time updates
- Explore the API documentation in README.md
- Customize the dashboard for your needs
- Deploy to production (Vercel, AWS, DigitalOcean, etc.)

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review the API documentation
- Check the issues page on GitHub
- Review Shopify API documentation: [shopify.dev](https://shopify.dev)

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique API secret keys in production
- Regularly rotate access tokens
- Use HTTPS in production
- Keep dependencies updated

---

Ready to start? Run `npm run dev` and open [http://localhost:3000](http://localhost:3000)!
