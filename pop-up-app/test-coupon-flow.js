#!/usr/bin/env node

/**
 * Comprehensive Coupon Flow Test Script
 * Tests the complete discount code generation and validation process
 */

const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:8888', // Adjust port as needed
  shopDomain: 'booksss12345.myshopify.com',
  testEmail: 'test@example.com',
  testPhone: '+1234567890'
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Validate discount code generation
function testDiscountCodeGeneration() {
  log('\n🧪 Test 1: Discount Code Generation', 'cyan');
  
  // Simulate the frontend code generation logic
  const timestamp = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const paddedRandom = (random + '0000').substr(0, 4);
  const testCode = `POPUP-${timestamp}-${paddedRandom}`.replace(/[^A-Z0-9\-_]/g, '');
  
  log(`Generated code: ${testCode}`, 'blue');
  
  // Validate the code format
  const validPattern = /^[A-Z0-9\-_]{3,255}$/;
  const isValid = validPattern.test(testCode);
  
  if (isValid) {
    log('✅ Code format validation: PASSED', 'green');
    return testCode;
  } else {
    log('❌ Code format validation: FAILED', 'red');
    return null;
  }
}

// Test 2: API subscription endpoint
async function testApiSubscription(testCode) {
  log('\n🧪 Test 2: API Subscription Endpoint', 'cyan');
  
  const apiData = {
    email: TEST_CONFIG.testEmail,
    phone: TEST_CONFIG.testPhone,
    discount_code: testCode,
    block_id: 'test-block-123'
  };
  
  try {
    log('📤 Sending subscription request...', 'yellow');
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': TEST_CONFIG.shopDomain,
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiData)
    });
    
    if (response.ok) {
      const result = await response.json();
      log('✅ API subscription: SUCCESS', 'green');
      log(`📧 Email stored: ${result.discount_code ? 'YES' : 'NO'}`, 'blue');
      log(`🎟️ Discount code: ${result.discount_code}`, 'blue');
      log(`🏪 Shopify discount created: ${result.shopify_discount_created ? 'YES' : 'NO'}`, 'blue');
      log(`✅ Code validated: ${result.code_validated ? 'YES' : 'NO'}`, 'blue');
      
      if (result.shopify_discount_id) {
        log(`🆔 Shopify discount ID: ${result.shopify_discount_id}`, 'blue');
      }
      
      return result;
    } else {
      const errorText = await response.text();
      log(`❌ API subscription: FAILED (${response.status})`, 'red');
      log(`Error: ${errorText}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ API subscription: ERROR - ${error.message}`, 'red');
    return null;
  }
}

// Test 3: Database verification
async function testDatabaseVerification() {
  log('\n🧪 Test 3: Database Verification', 'cyan');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/subscribe`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      log('✅ Database connection: SUCCESS', 'green');
      log(`📊 Total subscribers: ${stats.stats.total}`, 'blue');
      log(`📅 Today's subscribers: ${stats.stats.today}`, 'blue');
      log(`📝 Recent subscribers: ${stats.stats.recent.length}`, 'blue');
      
      // Check if our test email is in recent subscribers
      const testSubscriber = stats.stats.recent.find(sub => sub.email === TEST_CONFIG.testEmail);
      if (testSubscriber) {
        log(`✅ Test subscriber found in database`, 'green');
        log(`🎟️ Stored discount code: ${testSubscriber.discountCode}`, 'blue');
      } else {
        log(`⚠️ Test subscriber not found in recent list`, 'yellow');
      }
      
      return stats;
    } else {
      log(`❌ Database verification: FAILED (${response.status})`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Database verification: ERROR - ${error.message}`, 'red');
    return null;
  }
}

// Test 4: Shopify scope verification
function testShopifyScopes() {
  log('\n🧪 Test 4: Shopify App Configuration', 'cyan');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.join(__dirname, 'shopify.app.toml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for write_price_rules scope
    const hasWritePriceRules = configContent.includes('write_price_rules');
    
    if (hasWritePriceRules) {
      log('✅ write_price_rules scope: CONFIGURED', 'green');
    } else {
      log('❌ write_price_rules scope: MISSING', 'red');
      log('💡 Add "write_price_rules" to scopes in shopify.app.toml', 'yellow');
    }
    
    // Check for write_products scope
    const hasWriteProducts = configContent.includes('write_products');
    
    if (hasWriteProducts) {
      log('✅ write_products scope: CONFIGURED', 'green');
    } else {
      log('❌ write_products scope: MISSING', 'red');
    }
    
    return hasWritePriceRules && hasWriteProducts;
  } catch (error) {
    log(`❌ Config file check: ERROR - ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Coupon Flow Tests', 'magenta');
  log('=' * 50, 'magenta');
  
  const results = {
    codeGeneration: false,
    apiSubscription: false,
    databaseVerification: false,
    shopifyScopes: false
  };
  
  // Test 1: Code Generation
  const testCode = testDiscountCodeGeneration();
  results.codeGeneration = testCode !== null;
  
  // Test 2: API Subscription
  if (testCode) {
    const apiResult = await testApiSubscription(testCode);
    results.apiSubscription = apiResult !== null;
  }
  
  // Test 3: Database Verification
  const dbResult = await testDatabaseVerification();
  results.databaseVerification = dbResult !== null;
  
  // Test 4: Shopify Scopes
  results.shopifyScopes = testShopifyScopes();
  
  // Summary
  log('\n📊 Test Summary', 'magenta');
  log('=' * 30, 'magenta');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test}: ${status}`, color);
  });
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Your coupon system should work correctly.', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the issues above.', 'yellow');
  }
  
  // Recommendations
  log('\n💡 Next Steps:', 'cyan');
  log('1. Ensure your development server is running on the correct port', 'blue');
  log('2. Install your app in a Shopify development store', 'blue');
  log('3. Test the popup on your store\'s frontend', 'blue');
  log('4. Verify discount codes work at checkout', 'blue');
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log(`💥 Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testDiscountCodeGeneration, testApiSubscription };