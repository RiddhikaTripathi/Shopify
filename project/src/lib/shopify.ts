import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_products', 'read_orders', 'read_customers', 'read_inventory'],
  hostName: process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

export interface ShopifyClientConfig {
  shop: string;
  accessToken: string;
}

export function createShopifyClient(config: ShopifyClientConfig) {
  const session = shopify.session.customAppSession(config.shop);
  session.accessToken = config.accessToken;

  return new shopify.clients.Rest({ session });
}
