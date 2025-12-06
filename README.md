# Shopify Multi-Tenant Analytics System

A comprehensive, production-ready multi-tenant Shopify data ingestion and analytics platform built with Next.js, Node.js, Prisma, PostgreSQL (Supabase), and featuring real-time webhooks, scheduled syncs, and rich data visualizations.

## Features

- **Multi-Tenant Architecture**: Manage multiple Shopify stores in a single platform with complete data isolation
- **Real-Time Data Ingestion**: Webhook handlers for products, orders, and customers
- **Scheduled Sync Jobs**: Automated periodic syncing of all store data every 6 hours
- **Analytics Dashboard**: Beautiful charts and metrics for revenue, orders, customers, and trends
- **RESTful API**: Complete API for managing stores, triggering syncs, and retrieving analytics
- **Type-Safe**: Built with TypeScript for robust type checking
- **Production-Ready**: Docker containers, multi-stage builds, and deployment configurations included

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Chart.js
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Shopify Integration**: @shopify/shopify-api
- **Scheduler**: node-cron for automated sync jobs
- **Deployment**: Docker, Docker Compose

## Architecture

```
┌─────────────────┐
│  Next.js App    │
│  (Frontend +    │
│   API Routes)   │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
    ┌────▼────┐   ┌────▼────────┐
    │ Prisma  │   │  Scheduler  │
    │  ORM    │   │  (Cron)     │
    └────┬────┘   └────┬────────┘
         │             │
         └──────┬──────┘
                │
        ┌───────▼────────┐
        │   PostgreSQL   │
        │   (Supabase)   │
        └────────────────┘
                ▲
                │
        ┌───────┴────────┐
        │ Shopify API    │
        │  + Webhooks    │
        └────────────────┘
```

## Database Schema

The system uses a normalized multi-tenant database schema with the following tables:

- **stores**: Store credentials and metadata
- **products**: Product catalog data
- **orders**: Order transactions and details
- **customers**: Customer information
- **sync_jobs**: Job history and status tracking
- **analytics_daily**: Pre-computed daily analytics

All tables use Row-Level Security (RLS) policies for data isolation.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase account)
- Shopify Partner account with API credentials
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopify-analytics-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_SECRET_KEY="your-secret-key"
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
The database schema has already been created in Supabase. You can view tables using:
```bash
npx prisma studio
```

6. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Running the Scheduler

In a separate terminal, start the scheduler for automated syncs:

```bash
npm run scheduler
```

The scheduler runs two jobs:
- **Full Sync**: Every 6 hours - syncs products, orders, customers
- **Analytics**: Daily at 1:00 AM - computes daily analytics

## API Documentation

### Stores

#### List all stores
```
GET /api/stores
```

#### Create a new store
```
POST /api/stores
Content-Type: application/json

{
  "shopDomain": "mystore.myshopify.com",
  "storeName": "My Store",
  "accessToken": "shpat_..."
}
```

#### Get store details
```
GET /api/stores/:id
```

#### Update store
```
PATCH /api/stores/:id
Content-Type: application/json

{
  "isActive": true
}
```

#### Delete store
```
DELETE /api/stores/:id
```

#### Trigger sync
```
POST /api/stores/:id/sync
```

### Analytics

#### Get analytics data
```
GET /api/stores/:id/analytics?days=30
```

### Data Access

#### Get products
```
GET /api/stores/:id/products?page=1&limit=50
```

#### Get orders
```
GET /api/stores/:id/orders?page=1&limit=50
```

### Webhooks

#### Shopify webhook endpoint
```
POST /api/webhooks/shopify
Headers:
  X-Shopify-Hmac-Sha256: <signature>
  X-Shopify-Topic: <topic>
  X-Shopify-Shop-Domain: <shop-domain>
```

Supported topics:
- `products/create`
- `products/update`
- `orders/create`
- `orders/updated`
- `customers/create`
- `customers/update`

## Setting Up Shopify App

1. Create a custom app in your Shopify Partner Dashboard
2. Add the following scopes:
   - `read_products`
   - `read_orders`
   - `read_customers`
   - `read_inventory`

3. Generate API credentials and add them to `.env`

4. Set up webhooks in Shopify pointing to:
   ```
   https://your-domain.com/api/webhooks/shopify
   ```

## Deployment

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- Web application on port 3000
- Scheduler service

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Run the scheduler in a separate process:
```bash
npm run scheduler
```

## Project Structure

```
shopify-analytics-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── scheduler/
│   └── index.ts               # Cron job scheduler
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── stores/        # Store management endpoints
│   │   │   └── webhooks/      # Webhook handlers
│   │   ├── analytics/         # Analytics pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── AddStoreModal.tsx
│   │   ├── AnalyticsChart.tsx
│   │   ├── StatCard.tsx
│   │   └── StoreCard.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── prisma.ts          # Prisma client
│   │   ├── shopify.ts         # Shopify API client
│   │   └── supabase.ts        # Supabase client
│   └── services/              # Business logic
│       ├── analytics.ts       # Analytics service
│       ├── ingestion.ts       # Data ingestion service
│       └── sync-job.ts        # Sync job management
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Web app Dockerfile
├── Dockerfile.scheduler       # Scheduler Dockerfile
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## Key Features Explained

### Multi-Tenant Data Isolation

Each store's data is completely isolated using:
- Store ID foreign keys on all data tables
- Row-Level Security (RLS) policies in PostgreSQL
- API-level checks for store access

### Data Ingestion

The system ingests data in two ways:

1. **Bulk Sync**: Via API polling (triggered manually or scheduled)
   - Fetches all products, orders, and customers
   - Handles pagination automatically
   - Updates existing records or creates new ones

2. **Real-Time Webhooks**: Instant updates from Shopify
   - Receives webhooks for data changes
   - Verifies webhook signatures for security
   - Updates database in real-time

### Analytics Computation

Daily analytics are computed from raw order data:
- Total revenue
- Total orders
- Average order value
- New customers

Analytics are pre-computed and stored for fast dashboard loading.

### Scheduler

The node-cron scheduler runs background jobs:
- **Every 6 hours**: Full sync of all active stores
- **Daily at 1 AM**: Compute previous day's analytics

## Monitoring and Logs

### Application Logs

View logs for the web application:
```bash
docker-compose logs -f app
```

View logs for the scheduler:
```bash
docker-compose logs -f scheduler
```

### Database Access

Access the database using Prisma Studio:
```bash
npx prisma studio
```

### Sync Job Status

Check sync job status in the database or through the API:
```sql
SELECT * FROM sync_jobs ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Sync Fails with Authentication Error

- Verify Shopify access token is valid
- Check that all required scopes are granted
- Ensure store domain is correct (e.g., `store.myshopify.com`)

### Webhooks Not Receiving Data

- Verify webhook URL is publicly accessible
- Check webhook signature verification
- Ensure `SHOPIFY_API_SECRET` matches your Shopify app

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler settings
- Ensure database has been properly migrated

### Charts Not Displaying

- Ensure data has been synced at least once
- Check that analytics have been computed
- Verify date range has data

## Security Considerations

- Store access tokens are stored encrypted
- Webhook signatures are verified
- API endpoints can be protected with API keys
- Row-Level Security (RLS) enforces data isolation
- Environment variables for sensitive data
- CORS properly configured for production

## Performance Optimization

- Pagination on all list endpoints
- Database indexes on frequently queried columns
- Pre-computed analytics for fast dashboard loads
- Efficient bulk upsert operations
- Connection pooling via Prisma

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review API error responses

## Roadmap

Future enhancements:
- [ ] Multi-currency support
- [ ] Advanced filtering and search
- [ ] Export reports to CSV/PDF
- [ ] Email notifications for sync failures
- [ ] Dashboard customization
- [ ] Real-time websocket updates
- [ ] Inventory tracking and alerts
- [ ] Customer segmentation
- [ ] Revenue forecasting
- [ ] Multi-user access with roles

---

Built with Next.js, Prisma, and Supabase

# Author
Riddhika Tripathi
