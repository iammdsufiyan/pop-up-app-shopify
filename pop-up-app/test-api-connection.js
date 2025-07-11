import fetch from 'node-fetch';

async function testApiConnection() {
  console.log('🔍 Testing API connection...');
  
  const testData = {
    email: 'test-user@example.com',
    phone: '+1234567890',
    discount_code: 'TEST123',
    block_id: 'api-test'
  };
  
  const ports = [55454, 9293, 3457, 54796, 54225, 3000];
  
  for (const port of ports) {
    try {
      const endpoint = `http://localhost:${port}/api/subscribe`;
      console.log(`🔄 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Shop-Domain': 'test-shop.myshopify.com'
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS on port ${port}:`, result);
        
        // Test GET endpoint too
        const getResponse = await fetch(`http://localhost:${port}/api/subscribe`);
        if (getResponse.ok) {
          const stats = await getResponse.json();
          console.log('📊 Database stats:', stats);
        }
        
        return port;
      } else {
        console.log(`❌ Port ${port} failed with status:`, response.status);
      }
    } catch (error) {
      console.log(`❌ Port ${port} error:`, error.message);
    }
  }
  
  console.log('❌ No working API endpoints found');
  return null;
}

testApiConnection();