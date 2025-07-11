import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestData() {
  console.log('🧹 Clearing test data from database...');
  
  try {
    // Delete all test subscribers
    const deleted = await prisma.popupSubscriber.deleteMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'test' } },
          { email: { contains: 'demo' } },
          { blockId: 'test-block-1' }
        ]
      }
    });
    
    console.log(`✅ Deleted ${deleted.count} test subscribers`);
    
    // Show remaining real subscribers
    const remaining = await prisma.popupSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      take: 10
    });
    
    console.log('\n📊 Remaining subscribers in database:');
    if (remaining.length === 0) {
      console.log('   No subscribers found - database is clean!');
    } else {
      remaining.forEach(sub => {
        console.log(`   📧 ${sub.email} | 📱 ${sub.phone || 'No phone'} | 🎟️ ${sub.discountCode} | 📅 ${sub.subscribedAt.toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestData();