import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with test popup subscribers...')

  // Create test subscribers
  const testSubscribers = [
    {
      email: 'john.doe@example.com',
      phone: '+1234567890',
      discountCode: 'POPUP123ABC',
      blockId: 'test-block-1',
      shopDomain: 'booksss12345.myshopify.com',
      subscribedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isActive: true,
    },
    {
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      discountCode: 'POPUP456DEF',
      blockId: 'test-block-1',
      shopDomain: 'booksss12345.myshopify.com',
      subscribedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isActive: true,
    },
    {
      email: 'test.user@example.com',
      phone: null,
      discountCode: 'POPUP789GHI',
      blockId: 'test-block-1',
      shopDomain: 'booksss12345.myshopify.com',
      subscribedAt: new Date(), // Today
      isActive: true,
    },
    {
      email: 'demo.customer@example.com',
      phone: '+1122334455',
      discountCode: 'POPUPXYZABC',
      blockId: 'test-block-1',
      shopDomain: 'booksss12345.myshopify.com',
      subscribedAt: new Date(), // Today
      isActive: true,
    },
  ]

  for (const subscriber of testSubscribers) {
    await prisma.popupSubscriber.create({
      data: subscriber,
    })
    console.log(`✅ Created subscriber: ${subscriber.email}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })