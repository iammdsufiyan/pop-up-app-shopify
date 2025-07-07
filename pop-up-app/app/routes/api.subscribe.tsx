import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// 🚀 API endpoint to handle pop-up form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    console.log("🚀 API Subscribe endpoint called!");
    
    // Get the shop domain from headers or session
    const shopDomain = request.headers.get("x-shopify-shop-domain") ||
                      request.headers.get("referer")?.match(/https?:\/\/([^\/]+)/)?.[1] ||
                      "booksss12345.myshopify.com"; // fallback for development

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

    // Here you can integrate with email marketing services
    // Example: Mailchimp, Klaviyo, SendGrid, etc.
    
    // You can also create a discount code in Shopify
    // This would require additional GraphQL mutations

    return json({
      success: true,
      message: "Successfully subscribed!",
      discount_code,
      subscriber_id: subscriber.id,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
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
        }
      }
    );
  }
};

// 🚀 GET endpoint to retrieve subscription stats
export const loader = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    
    // Get subscription statistics
    const totalSubscribers = await prisma.popupSubscriber.count({
      where: { isActive: true }
    });

    const todaySubscribers = await prisma.popupSubscriber.count({
      where: {
        isActive: true,
        subscribedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
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
        today: todaySubscribers,
        recent: recentSubscribers,
      }
    });

  } catch (error) {
    console.error("Stats error:", error);
    return json({ error: "Failed to fetch stats" }, { status: 500 });
  }
};