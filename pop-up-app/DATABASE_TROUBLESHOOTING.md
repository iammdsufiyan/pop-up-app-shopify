# 🔧 Database Storage Troubleshooting Guide

## ✅ Issue Resolution Summary

**Problem**: Email and phone number data was not being stored in the database from popup submissions.

**Root Cause**: The popup's JavaScript was trying incorrect API endpoint ports. Your development server was running on port `54225`, but the popup was trying a hardcoded list of ports that didn't include this port.

**Solution**: Updated the popup block to include the correct port (`54225`) and improved the endpoint detection logic.

---

## 🔍 What Was Happening

### The Data Flow
1. **Frontend (Popup)** → Collects email/phone → Sends to API
2. **API Endpoint** → Validates data → Stores in database
3. **Database** → Stores subscriber information

### The Problem
- ✅ **Database Schema**: Correct (email, phone, discountCode, etc.)
- ✅ **API Endpoint**: Working perfectly (`/api/subscribe`)
- ❌ **Frontend Connection**: Trying wrong ports

### The Fix
Updated [`popup.liquid`](extensions/discount-popup/blocks/popup.liquid:370) to include port `54225` in the endpoint list:

```javascript
// Before (missing your port)
const devPorts = [49176, 64657, 63226, ...]; // Missing 54225

// After (includes your port)
const devPorts = [54225, 49176, 64657, 63226, ...]; // Added 54225 first
```

---

## 🧪 Test Results

### ✅ API Endpoint Test
```bash
curl -X POST http://localhost:54225/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"1234567890","discount_code":"TEST10","block_id":"test-block"}'

# Result: {"success":true,"message":"Successfully subscribed!","subscriber_id":"cmcu3zv9u0000yg4wljczw5xb"}
```

### ✅ Database Verification
```bash
node test-db.js

# Result: Found 10 subscribers including our test data:
# 1. Email: frontend-test@example.com, Phone: 9876543210
# 2. Email: api-test@example.com, Phone: 1111111111
# 3. Email: test@example.com, Phone: 1234567890
```

### ✅ Frontend Connection Test
- **API Connection**: ✅ SUCCESS! Connected to `http://localhost:54225/api/subscribe`
- **Form Submission**: ✅ Form submitted successfully with email and phone

---

## 🚀 How to Prevent This Issue

### 1. Check Your Development Server Port
```bash
# Find your current development server port
netstat -an | grep LISTEN | grep -E "(3000|5173|54225)"

# Or check running processes
ps aux | grep -E "(node|npm|shopify)" | grep -v grep
```

### 2. Update Popup Configuration
If your development server changes ports, update the [`popup.liquid`](extensions/discount-popup/blocks/popup.liquid:370) file:

```javascript
// Add your new port to the beginning of the list
const devPorts = [YOUR_NEW_PORT, 54225, 49176, 64657, ...];
```

### 3. Test API Connection
Use the test page we created:
```bash
# Open in browser
open pop-up-app/test-popup-connection.html
```

### 4. Verify Database Storage
```bash
# Run the database test script
node test-db.js
```

---

## 📊 Database Schema Reference

The [`PopupSubscriber`](prisma/schema.prisma:34-49) model stores:

```prisma
model PopupSubscriber {
  id            String    @id @default(cuid())
  email         String    // ✅ Required
  phone         String?   // ✅ Optional
  discountCode  String    // ✅ Required
  blockId       String?   // ✅ Optional
  shopDomain    String    // ✅ Required
  subscribedAt  DateTime  @default(now())
  isActive      Boolean   @default(true)
  usedDiscount  Boolean   @default(false)
  usedAt        DateTime?
}
```

---

## 🔧 Debugging Commands

### Check Database Contents
```bash
node test-db.js
```

### Test API Directly
```bash
curl -X POST http://localhost:54225/api/subscribe \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: your-shop.myshopify.com" \
  -d '{"email":"debug@test.com","phone":"1234567890","discount_code":"DEBUG10","block_id":"debug-test"}'
```

### Check Development Server
```bash
# Check if server is running
ps aux | grep "remix vite:dev"

# Check port
netstat -an | grep LISTEN | grep 54225
```

### Reset Database (if needed)
```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

## 🎯 Current Status

✅ **Database**: Working perfectly  
✅ **API Endpoint**: Responding correctly  
✅ **Frontend Connection**: Fixed and tested  
✅ **Data Storage**: Email and phone numbers saving properly  

**Your popup is now fully functional and storing all subscriber data correctly!**