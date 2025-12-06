# API Reference

Complete API documentation for the Shopify Analytics System.

## Base URL

```
http://localhost:3000/api
```

In production, replace with your domain.

## Authentication

Currently, the API is open. In production, you should add authentication middleware. You can use the `API_SECRET_KEY` environment variable to implement API key authentication.

Example implementation:
```typescript
if (request.headers.get('x-api-key') !== process.env.API_SECRET_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Stores

### List all stores

Returns a list of all Shopify stores in the system.

**Endpoint:** `GET /api/stores`

**Response:**
```json
{
  "stores": [
    {
      "id": "uuid",
      "shopDomain": "mystore.myshopify.com",
      "storeName": "My Store",
      "isActive": true,
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create a store

Add a new Shopify store to the system.

**Endpoint:** `POST /api/stores`

**Request Body:**
```json
{
  "shopDomain": "mystore.myshopify.com",
  "storeName": "My Store",
  "accessToken": "shpat_..."
}
```

**Response:**
```json
{
  "store": {
    "id": "uuid",
    "shopDomain": "mystore.myshopify.com",
    "storeName": "My Store",
    "isActive": true,
    "lastSyncAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or store already exists
- `500 Internal Server Error` - Server error

### Get store details

Retrieve details for a specific store.

**Endpoint:** `GET /api/stores/:id`

**Parameters:**
- `id` (path) - Store UUID

**Response:**
```json
{
  "store": {
    "id": "uuid",
    "shopDomain": "mystore.myshopify.com",
    "storeName": "My Store",
    "isActive": true,
    "lastSyncAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Store not found
- `500 Internal Server Error` - Server error

### Update store

Update store settings.

**Endpoint:** `PATCH /api/stores/:id`

**Parameters:**
- `id` (path) - Store UUID

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "store": {
    "id": "uuid",
    "shopDomain": "mystore.myshopify.com",
    "storeName": "My Store",
    "isActive": false,
    "lastSyncAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### Delete store

Remove a store and all its associated data.

**Endpoint:** `DELETE /api/stores/:id`

**Parameters:**
- `id` (path) - Store UUID

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

## Sync Operations

### Trigger full sync

Initiates a full data sync for a store (products, orders, customers).

**Endpoint:** `POST /api/stores/:id/sync`

**Parameters:**
- `id` (path) - Store UUID

**Response:**
```json
{
  "success": true,
  "message": "Sync completed successfully"
}
```

**Note:** This operation may take several minutes for stores with large datasets.

**Error Responses:**
- `404 Not Found` - Store not found
- `500 Internal Server Error` - Sync failed

---

## Analytics

### Get analytics data

Retrieve analytics data for a store.

**Endpoint:** `GET /api/stores/:id/analytics`

**Parameters:**
- `id` (path) - Store UUID
- `days` (query) - Number of days to retrieve (default: 30)

**Example:**
```
GET /api/stores/abc-123/analytics?days=7
```

**Response:**
```json
{
  "analytics": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "date": "2024-01-15",
      "totalOrders": 45,
      "totalRevenue": "5432.50",
      "averageOrderValue": "120.72",
      "newCustomers": 12,
      "createdAt": "2024-01-16T01:00:00Z"
    }
  ],
  "summary": {
    "totalRevenue": 75432.50,
    "totalOrders": 567,
    "averageOrderValue": 133.04,
    "totalNewCustomers": 89
  }
}
```

---

## Products

### List products

Retrieve paginated list of products for a store.

**Endpoint:** `GET /api/stores/:id/products`

**Parameters:**
- `id` (path) - Store UUID
- `page` (query) - Page number (default: 1)
- `limit` (query) - Results per page (default: 50, max: 100)

**Example:**
```
GET /api/stores/abc-123/products?page=1&limit=50
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "shopifyId": "1234567890",
      "title": "Awesome Product",
      "vendor": "My Brand",
      "productType": "Electronics",
      "status": "active",
      "tags": ["new", "featured"],
      "price": "99.99",
      "inventoryQuantity": 50,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

---

## Orders

### List orders

Retrieve paginated list of orders for a store.

**Endpoint:** `GET /api/stores/:id/orders`

**Parameters:**
- `id` (path) - Store UUID
- `page` (query) - Page number (default: 1)
- `limit` (query) - Results per page (default: 50, max: 100)

**Example:**
```
GET /api/stores/abc-123/orders?page=1&limit=50
```

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "shopifyId": "1234567890",
      "orderNumber": "1001",
      "email": "customer@example.com",
      "totalPrice": "125.50",
      "subtotalPrice": "100.00",
      "totalTax": "10.50",
      "financialStatus": "paid",
      "fulfillmentStatus": "fulfilled",
      "currency": "USD",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 567,
    "pages": 12
  }
}
```

---

## Webhooks

### Shopify webhook endpoint

Receives webhook events from Shopify for real-time updates.

**Endpoint:** `POST /api/webhooks/shopify`

**Headers:**
- `X-Shopify-Hmac-Sha256` - Webhook signature for verification
- `X-Shopify-Topic` - Event type
- `X-Shopify-Shop-Domain` - Store domain

**Supported Topics:**
- `products/create`
- `products/update`
- `orders/create`
- `orders/updated`
- `customers/create`
- `customers/update`

**Request Body:**
The webhook payload from Shopify (varies by topic).

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid webhook signature
- `404 Not Found` - Store not found
- `500 Internal Server Error` - Processing failed

**Security:**
All webhooks are verified using HMAC-SHA256 signature verification with your `SHOPIFY_API_SECRET`.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting middleware to prevent abuse.

Recommended implementation using `next-rate-limit`:

```typescript
import rateLimit from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function middleware(request: Request) {
  await limiter.check(request, 10, 'CACHE_TOKEN');
}
```

---

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (starting at 1)
- `limit` - Results per page (default varies by endpoint)

All paginated responses include a `pagination` object:

```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

---

## Examples

### cURL Examples

**List stores:**
```bash
curl http://localhost:3000/api/stores
```

**Create store:**
```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "shopDomain": "mystore.myshopify.com",
    "storeName": "My Store",
    "accessToken": "shpat_..."
  }'
```

**Trigger sync:**
```bash
curl -X POST http://localhost:3000/api/stores/abc-123/sync
```

**Get analytics:**
```bash
curl "http://localhost:3000/api/stores/abc-123/analytics?days=30"
```

### JavaScript/TypeScript Examples

**Fetch stores:**
```typescript
const response = await fetch('http://localhost:3000/api/stores');
const data = await response.json();
console.log(data.stores);
```

**Create store:**
```typescript
const response = await fetch('http://localhost:3000/api/stores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    shopDomain: 'mystore.myshopify.com',
    storeName: 'My Store',
    accessToken: 'shpat_...',
  }),
});

const data = await response.json();
console.log(data.store);
```

**Get analytics:**
```typescript
const storeId = 'abc-123';
const days = 30;

const response = await fetch(
  `http://localhost:3000/api/stores/${storeId}/analytics?days=${days}`
);
const data = await response.json();

console.log('Summary:', data.summary);
console.log('Daily data:', data.analytics);
```

---

## Development

### Testing APIs with Postman

1. Import the API endpoints into Postman
2. Set base URL as a variable: `http://localhost:3000/api`
3. Create requests for each endpoint
4. Test error cases by providing invalid data

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Then configure Shopify webhooks to point to:
```
https://your-ngrok-url.ngrok.io/api/webhooks/shopify
```

---

## Best Practices

1. **Always validate input data** before processing
2. **Use pagination** for large datasets
3. **Implement rate limiting** in production
4. **Add authentication** for API endpoints
5. **Log all API requests** for debugging
6. **Handle errors gracefully** with proper status codes
7. **Use HTTPS** in production
8. **Monitor API performance** and optimize slow queries
9. **Cache frequently accessed data** where appropriate
10. **Document any custom endpoints** you add

---

For more information, see the main [README.md](README.md) and [SETUP.md](SETUP.md) files.
