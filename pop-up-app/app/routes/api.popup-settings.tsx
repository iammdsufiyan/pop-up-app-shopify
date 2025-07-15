import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// 🚀 API endpoint to get popup settings for the storefront
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
        "Access-Control-Allow-Credentials": "false",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // Get the shop domain from headers or URL
    const shopDomain = request.headers.get("x-shopify-shop-domain") ||
                      request.headers.get("referer")?.match(/https?:\/\/([^\/]+)/)?.[1] ||
                      "booksss12345.myshopify.com"; // fallback for development

    console.log("🏪 Fetching popup settings for shop:", shopDomain);

    // Get popup settings from database
    let settings = await prisma.popupSettings.findUnique({
      where: { shopDomain }
    });

    // Create default settings if none exist
    if (!settings) {
      console.log("⚠️ No settings found, creating defaults for:", shopDomain);
      settings = await prisma.popupSettings.create({
        data: {
          shopDomain,
          isEnabled: true,
          title: "Get 10% Off Your First Order!",
          description: "Enter your email to receive an exclusive discount code",
          discountPercentage: 10,
          position: "center",
          triggerType: "page_load",
          delaySeconds: 5,
          frequency: "once_per_session",
          backgroundColor: "#ffffff",
          textColor: "#333333",
          buttonColor: "#007cba",
        }
      });
    }

    console.log("✅ Popup settings retrieved:", {
      isEnabled: settings.isEnabled,
      title: settings.title,
      discountPercentage: settings.discountPercentage,
      position: settings.position
    });

    return json({
      success: true,
      settings: {
        isEnabled: settings.isEnabled,
        title: settings.title,
        description: settings.description,
        discountPercentage: settings.discountPercentage,
        position: settings.position,
        triggerType: settings.triggerType,
        delaySeconds: settings.delaySeconds,
        frequency: settings.frequency,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        buttonColor: settings.buttonColor,
      }
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
        "Access-Control-Allow-Credentials": "false",
      }
    });

  } catch (error) {
    console.error("❌ Error fetching popup settings:", error);
    return json({ 
      success: false, 
      error: "Failed to fetch popup settings",
      // Return default settings as fallback
      settings: {
        isEnabled: true,
        title: "Get 10% Off Your First Order!",
        description: "Enter your email to receive an exclusive discount code",
        discountPercentage: 10,
        position: "center",
        triggerType: "page_load",
        delaySeconds: 5,
        frequency: "once_per_session",
        backgroundColor: "#ffffff",
        textColor: "#333333",
        buttonColor: "#007cba",
      }
    }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
      }
    });
  }
};