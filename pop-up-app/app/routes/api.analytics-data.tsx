import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log(`📊 Fetching analytics data for ${shop} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get daily analytics data
    const dailyAnalytics = await prisma.dailyAnalytics.findMany({
      where: {
        shopDomain: shop,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Get detailed event analytics for the period
    const eventAnalytics = await prisma.popupAnalytics.findMany({
      where: {
        shopDomain: shop,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate summary statistics
    const totalVisits = dailyAnalytics.reduce((sum, day) => sum + day.totalVisits, 0);
    const totalPopupViews = dailyAnalytics.reduce((sum, day) => sum + day.popupViews, 0);
    const totalSubmissions = dailyAnalytics.reduce((sum, day) => sum + day.popupSubmissions, 0);
    const averageConversionRate = totalPopupViews > 0 ? (totalSubmissions / totalPopupViews) * 100 : 0;

    // Get unique visitors count
    const uniqueVisitors = await prisma.popupAnalytics.groupBy({
      by: ['sessionId'],
      where: {
        shopDomain: shop,
        eventType: 'visit',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Prepare chart data
    const chartData = {
      labels: [] as string[],
      visits: [] as number[],
      popupViews: [] as number[],
      submissions: [] as number[],
      conversionRates: [] as number[]
    };

    // Fill in data for each day in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyAnalytics.find(day => 
        day.date.toISOString().split('T')[0] === dateStr
      );

      chartData.labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      chartData.visits.push(dayData?.totalVisits || 0);
      chartData.popupViews.push(dayData?.popupViews || 0);
      chartData.submissions.push(dayData?.popupSubmissions || 0);
      chartData.conversionRates.push(dayData?.conversionRate || 0);
    }

    // Event breakdown
    const eventBreakdown = eventAnalytics.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate success rate metrics
    const successRate = totalPopupViews > 0 ? (totalSubmissions / totalPopupViews) * 100 : 0;
    const viewToVisitRate = totalVisits > 0 ? (totalPopupViews / totalVisits) * 100 : 0;
    
    // Get subscription details for popup view
    const subscriptionEvents = eventAnalytics.filter(event => event.eventType === 'popup_submit');
    const subscriptionsByDay = dailyAnalytics.map(day => ({
      date: day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      subscriptions: day.popupSubmissions,
      views: day.popupViews,
      successRate: day.popupViews > 0 ? (day.popupSubmissions / day.popupViews) * 100 : 0
    }));

    const analyticsData = {
      summary: {
        totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        totalPopupViews,
        totalSubmissions,
        conversionRate: Math.round(averageConversionRate * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        viewToVisitRate: Math.round(viewToVisitRate * 100) / 100
      },
      chartData,
      eventBreakdown,
      dailyAnalytics,
      recentEvents: eventAnalytics.slice(0, 50), // Last 50 events
      subscriptionDetails: {
        totalSubscriptions: totalSubmissions,
        successRate: Math.round(successRate * 100) / 100,
        dailyBreakdown: subscriptionsByDay,
        recentSubscriptions: subscriptionEvents.slice(0, 20).map(event => ({
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          pageUrl: event.pageUrl,
          userAgent: event.userAgent
        }))
      }
    };

    console.log('✅ Analytics data retrieved:', {
      dailyRecords: dailyAnalytics.length,
      totalEvents: eventAnalytics.length,
      summary: analyticsData.summary
    });

    return json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("❌ Analytics data fetch error:", error);
    return json({ 
      success: false, 
      error: "Failed to fetch analytics data" 
    }, { status: 500 });
  }
};