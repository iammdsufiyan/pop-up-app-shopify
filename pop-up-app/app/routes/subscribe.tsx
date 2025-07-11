import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// Handle CORS preflight requests
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
        "Access-Control-Allow-Credentials": "false",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Handle GET requests for stats
  try {
    const totalSubscribers = await prisma.popupSubscriber.count({
      where: { isActive: true }
    });

    const recentSubscribers = await prisma.popupSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        discountCode: true,
        subscribedAt: true,
        blockId: true,
      }
    });

    return json({
      stats: {
        total: totalSubscribers,
        recent: recentSubscribers,
      }
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
      }
    });

  } catch (error) {
    console.error("Stats error:", error);
    return json({ error: "Failed to fetch stats" }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
      }
    });
  }
};

// Handle POST requests for form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    console.log("🚀 Subscribe endpoint called!");
    
    const shopDomain = request.headers.get("x-shopify-shop-domain") ||
                      request.headers.get("referer")?.match(/https?:\/\/([^\/]+)/)?.[1] ||
                      "booksss12345.myshopify.com";

    console.log("🏪 Shop domain:", shopDomain);

    const body = await request.json();
    const { email, phone, discount_code, block_id } = body;

    console.log("📧 Received data:", { email, phone, discount_code, block_id });

    if (!email || !discount_code) {
      console.log("❌ Missing required fields");
      return json({ error: "Email and discount code are required" }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
          "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return json({ error: "Invalid email format" }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
          "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
        }
      });
    }

    // Save subscriber to database
    console.log("💾 Saving to database...");
    const subscriber = await prisma.popupSubscriber.create({
      data: {
        email,
        phone: phone || null,
        discountCode: discount_code,
        blockId: block_id,
        shopDomain,
        subscribedAt: new Date(),
        isActive: true,
      },
    });

    console.log("✅ Successfully saved subscriber:", subscriber.id);

    return json({
      success: true,
      message: "Successfully subscribed!",
      discount_code,
      subscriber_id: subscriber.id,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
        "Access-Control-Allow-Credentials": "false",
      }
    });

  } catch (error) {
    console.error("❌ Subscription error:", error);
    return json(
      { error: "Failed to process subscription", details: error instanceof Error ? error.message : String(error) },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
          "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept, Authorization",
        }
      }
    );
  }
};