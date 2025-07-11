#!/usr/bin/env node

/**
 * Database test script to verify popup subscriber data storage
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
    console.log('🔍 Testing database connection and popup subscriber storage...\n');
    
    try {
        // Test 1: Check database connection
        console.log('1️⃣ Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully\n');
        
        // Test 2: Check if PopupSubscriber table exists and get count
        console.log('2️⃣ Checking PopupSubscriber table...');
        const totalSubscribers = await prisma.popupSubscriber.count();
        console.log(`✅ PopupSubscriber table exists with ${totalSubscribers} records\n`);
        
        // Test 3: Get recent subscribers
        console.log('3️⃣ Fetching recent subscribers...');
        const recentSubscribers = await prisma.popupSubscriber.findMany({
            orderBy: { subscribedAt: 'desc' },
            take: 10
        });
        
        if (recentSubscribers.length > 0) {
            console.log(`✅ Found ${recentSubscribers.length} recent subscribers:`);
            recentSubscribers.forEach((sub, index) => {
                console.log(`   ${index + 1}. Email: ${sub.email}, Phone: ${sub.phone || 'N/A'}, Code: ${sub.discountCode}, Date: ${sub.subscribedAt.toISOString()}`);
            });
        } else {
            console.log('⚠️  No subscribers found in database');
        }
        console.log('');
        
        // Test 4: Create a test subscriber to verify write operations
        console.log('4️⃣ Testing database write operation...');
        const testEmail = `test-${Date.now()}@example.com`;
        const testPhone = '+1234567890';
        const testCode = 'TEST' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const testSubscriber = await prisma.popupSubscriber.create({
            data: {
                email: testEmail,
                phone: testPhone,
                discountCode: testCode,
                blockId: 'database-test',
                shopDomain: 'test-shop.myshopify.com',
                subscribedAt: new Date(),
                isActive: true,
            },
        });
        
        console.log('✅ Test subscriber created successfully:');
        console.log(`   ID: ${testSubscriber.id}`);
        console.log(`   Email: ${testSubscriber.email}`);
        console.log(`   Phone: ${testSubscriber.phone}`);
        console.log(`   Discount Code: ${testSubscriber.discountCode}\n`);
        
        // Test 5: Verify the test subscriber was saved
        console.log('5️⃣ Verifying test subscriber was saved...');
        const savedSubscriber = await prisma.popupSubscriber.findUnique({
            where: { id: testSubscriber.id }
        });
        
        if (savedSubscriber) {
            console.log('✅ Test subscriber verified in database');
            console.log(`   Retrieved: ${savedSubscriber.email} with phone ${savedSubscriber.phone}\n`);
        } else {
            console.log('❌ Test subscriber not found in database\n');
        }
        
        // Test 6: Clean up test data
        console.log('6️⃣ Cleaning up test data...');
        await prisma.popupSubscriber.delete({
            where: { id: testSubscriber.id }
        });
        console.log('✅ Test data cleaned up\n');
        
        console.log('🎉 All database tests passed! The database is working correctly.');
        console.log('\n📋 Summary:');
        console.log(`   - Database connection: ✅ Working`);
        console.log(`   - PopupSubscriber table: ✅ Exists`);
        console.log(`   - Total subscribers: ${totalSubscribers}`);
        console.log(`   - Write operations: ✅ Working`);
        console.log(`   - Read operations: ✅ Working`);
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure your development server is running');
        console.log('2. Check if Prisma migrations are applied: npm run prisma migrate deploy');
        console.log('3. Regenerate Prisma client: npm run prisma generate');
        console.log('4. Check database file permissions');
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testDatabase().catch(console.error);