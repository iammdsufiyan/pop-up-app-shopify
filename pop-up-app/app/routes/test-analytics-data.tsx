import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shopDomain") || "booksss12345.myshopify.com";
    
    console.log(`🔍 Testing analytics data for shop: ${shopDomain}`);

    // Get all analytics events for this shop
    const allEvents = await prisma.popupAnalytics.findMany({
      where: { shopDomain },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    // Get daily analytics
    const dailyAnalytics = await prisma.dailyAnalytics.findMany({
      where: { shopDomain },
      orderBy: { date: 'desc' },
      take: 10
    });

    // Count events by type
    const eventCounts = await prisma.popupAnalytics.groupBy({
      by: ['eventType'],
      where: { shopDomain },
      _count: { eventType: true }
    });

    const result = {
      success: true,
      shopDomain,
      totalEvents: allEvents.length,
      recentEvents: allEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        sessionId: event.sessionId,
        timestamp: event.timestamp
      })),
      dailyAnalytics: dailyAnalytics.map(day => ({
        date: day.date,
        totalVisits: day.totalVisits,
        popupViews: day.popupViews,
        popupSubmissions: day.popupSubmissions,
        conversionRate: day.conversionRate
      })),
      eventCounts: eventCounts.map(count => ({
        eventType: count.eventType,
        count: count._count.eventType
      }))
    };

    console.log('✅ Test analytics data:', result);
    return json(result);

  } catch (error) {
    console.error("❌ Test analytics error:", error);
    return json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
};