import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Checking database for subscribers...');
    
    const subscribers = await prisma.popupSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 Found ${subscribers.length} subscribers:`);
    subscribers.forEach((sub, index) => {
      console.log(`${index + 1}. Email: ${sub.email}, Phone: ${sub.phone || 'N/A'}, Code: ${sub.discountCode}, Date: ${sub.subscribedAt}`);
    });
    
    // Check for our test submission
    const testSub = subscribers.find(s => s.email === 'test@example.com');
    if (testSub) {
      console.log('✅ Test submission found in database!');
      console.log('📧 Email:', testSub.email);
      console.log('📱 Phone:', testSub.phone);
      console.log('🎫 Discount Code:', testSub.discountCode);
    } else {
      console.log('❌ Test submission not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();