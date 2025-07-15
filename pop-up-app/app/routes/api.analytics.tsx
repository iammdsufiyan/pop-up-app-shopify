import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// Handle CORS preflight requests
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { 
      shopDomain, 
      eventType, 
      blockId, 
      sessionId, 
      userAgent, 
      ipAddress, 
      referrer, 
      pageUrl 
    } = body;

    console.log('📊 Analytics event received:', {
      shopDomain,
      eventType,
      blockId,
      sessionId
    });

    // Store the analytics event
    const analyticsEvent = await prisma.popupAnalytics.create({
      data: {
        shopDomain: shopDomain || 'unknown',
        eventType,
        blockId,
        sessionId,
        userAgent,
        ipAddress,
        referrer,
        pageUrl,
      }
    });

    // Update daily analytics aggregation
    await updateDailyAnalytics(shopDomain || 'unknown', eventType);

    console.log('✅ Analytics event stored:', analyticsEvent.id);

    return json({ 
      success: true, 
      eventId: analyticsEvent.id 
    });

  } catch (error) {
    console.error("❌ Analytics tracking error:", error);
    return json({ 
      success: false, 
      error: "Failed to track analytics event" 
    }, { status: 500 });
  }
};

async function updateDailyAnalytics(shopDomain: string, eventType: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get or create daily analytics record
    let dailyRecord = await prisma.dailyAnalytics.findUnique({
      where: {
        shopDomain_date: {
          shopDomain,
          date: today
        }
      }
    });

    if (!dailyRecord) {
      dailyRecord = await prisma.dailyAnalytics.create({
        data: {
          shopDomain,
          date: today,
          totalVisits: 0,
          uniqueVisitors: 0,
          popupViews: 0,
          popupSubmissions: 0,
          conversionRate: 0.0
        }
      });
    }

    // Update counters based on event type
    const updateData: any = {};

    switch (eventType) {
      case 'visit':
        updateData.totalVisits = { increment: 1 };
        break;
      case 'popup_view':
        updateData.popupViews = { increment: 1 };
        break;
      case 'popup_submit':
        updateData.popupSubmissions = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.dailyAnalytics.update({
        where: { id: dailyRecord.id },
        data: updateData
      });

      // Recalculate conversion rate
      const updated = await prisma.dailyAnalytics.findUnique({
        where: { id: dailyRecord.id }
      });

      if (updated && updated.popupViews > 0) {
        const conversionRate = (updated.popupSubmissions / updated.popupViews) * 100;
        await prisma.dailyAnalytics.update({
          where: { id: dailyRecord.id },
          data: { conversionRate }
        });
      }
    }

  } catch (error) {
    console.error("❌ Daily analytics update error:", error);
  }
}