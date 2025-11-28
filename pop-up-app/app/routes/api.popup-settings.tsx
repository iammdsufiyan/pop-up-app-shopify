import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// 🚀 API endpoint to get popup settings for the storefront
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Shop-Domain, Accept",
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop") ||
                      request.headers.get("x-shopify-shop-domain") ||
                      "booksss12345.myshopify.com";

    if (!shopDomain) {
      console.log("CORS headers:", corsHeaders);
      return json({ success: false, error: "Shop domain is required" }, { status: 400, headers: corsHeaders });
    }
    
    console.log("🏪 Fetching popup settings for shop:", shopDomain);

    const settings = await prisma.popupSettings.findFirst({
      where: { shopDomain },
      orderBy: { createdAt: 'desc' }
    });

    if (!settings) {
      console.log("⚠️ No settings found for shop:", shopDomain);
      return json({
        success: false,
        error: "No settings found for this shop.",
        settings: null
      }, { status: 404, headers: corsHeaders });
    }
    
    console.log("✅ Popup settings retrieved successfully for:", shopDomain);

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
      },
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("❌ Error fetching popup settings:", error);
    return json({
      success: false,
      error: "Failed to fetch popup settings due to an internal error.",
      details: error instanceof Error ? error.message : "Unknown error",
      settings: null
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
};