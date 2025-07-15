// Auto-generated API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? process.env.SHOPIFY_APP_URL || 'https://your-app.herokuapp.com'
    : `http://localhost:${process.env.PORT || 8888}`,
  ENDPOINTS: {
    SUBSCRIBE: '/api/subscribe',
    STATS: '/api/subscribe'
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Export current port for debugging
export const CURRENT_PORT = 8888;
