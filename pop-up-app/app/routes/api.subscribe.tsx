import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { DISCOUNT_QUERIES, createDiscountCodeInput, generateUniqueDiscountCode, validateDiscountCode, type DiscountCodeCreateResponse } from "../utils/graphql";

// 🚀 Handle CORS preflight requests for all HTTP methods
export const loader = async ({ request }: ActionFunctionArgs) => {
  // Handle CORS preflight requests
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

  // Handle GET requests for stats (no authentication required for testing)
  try {
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

// 🚀 API endpoint to handle pop-up form submissions
export const action = async ({ request }: ActionFunctionArgs) => {

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

    // Generate a unique discount code with proper validation
    let uniqueDiscountCode = generateUniqueDiscountCode();
    
    // Validate the generated code
    if (!validateDiscountCode(uniqueDiscountCode)) {
      console.log("⚠️ Generated code failed validation, regenerating...");
      uniqueDiscountCode = generateUniqueDiscountCode();
    }
    
    console.log("🎟️ Generated unique discount code:", uniqueDiscountCode);

    // Try to authenticate and create real Shopify discount code
    let realDiscountCode = uniqueDiscountCode; // Use generated code as default
    let shopifyDiscountId = null;
    let discountCreationSuccess = false;

    try {
      // Authenticate with Shopify Admin API
      const { admin } = await authenticate.admin(request);
      
      // Get discount percentage from popup settings or default to 10%
      const popupSettings = await prisma.popupSettings.findUnique({
        where: { shopDomain }
      });
      const discountPercentage = popupSettings?.discountPercentage || 10;

      console.log(`🏪 Creating ${discountPercentage}% discount code in Shopify...`);

      // Create discount code input with validated code
      const discountInput = createDiscountCodeInput(
        uniqueDiscountCode,
        discountPercentage,
        `Popup Discount - ${email}`
      );

      // Create the discount code in Shopify
      const response = await admin.graphql(DISCOUNT_QUERIES.CREATE_DISCOUNT_CODE, {
        variables: {
          basicCodeDiscount: discountInput
        }
      });

      const result = await response.json() as { data: DiscountCodeCreateResponse };

      if (result.data?.discountCodeBasicCreate?.userErrors?.length === 0) {
        realDiscountCode = uniqueDiscountCode;
        shopifyDiscountId = result.data.discountCodeBasicCreate.codeDiscountNode.id;
        discountCreationSuccess = true;
        console.log("✅ Successfully created Shopify discount code:", realDiscountCode);
        console.log("🆔 Shopify discount ID:", shopifyDiscountId);
        
        // Add a small delay to ensure the discount is fully created in Shopify
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the discount was created by querying it back
        try {
          const verifyResponse = await admin.graphql(`
            query getDiscountCode($id: ID!) {
              discountNode(id: $id) {
                id
                discount {
                  ... on DiscountCodeBasic {
                    title
                    codes(first: 1) {
                      edges {
                        node {
                          code
                        }
                      }
                    }
                  }
                }
              }
            }
          `, {
            variables: { id: shopifyDiscountId }
          });
          
          const verifyResult = await verifyResponse.json();
          if (verifyResult.data?.discountNode) {
            console.log("✅ Discount code verified in Shopify system");
          } else {
            console.log("⚠️ Discount code not found during verification");
            discountCreationSuccess = false;
          }
        } catch (verifyError) {
          console.log("⚠️ Could not verify discount code:", verifyError);
        }
        
      } else {
        console.log("⚠️ Failed to create Shopify discount code:", result.data?.discountCodeBasicCreate?.userErrors);
        console.log("📝 Falling back to local code storage only");
        discountCreationSuccess = false;
      }

    } catch (authError) {
      console.log("⚠️ Could not authenticate with Shopify Admin API:", authError);
      console.log("📝 Falling back to local code storage only");
      discountCreationSuccess = false;
    }

    // Save subscriber to database with the real discount code
    console.log("💾 Saving to database...");
    const subscriber = await prisma.popupSubscriber.create({
      data: {
        email,
        phone: phone || null,
        discountCode: realDiscountCode,
        blockId: block_id,
        shopDomain,
        subscribedAt: new Date(),
        isActive: true,
      },
    });

    console.log("✅ Successfully saved subscriber:", subscriber.id);
    console.log("🎟️ Final discount code:", realDiscountCode);

    // Here you can integrate with email marketing services
    // Example: Mailchimp, Klaviyo, SendGrid, etc.

    return json({
      success: true,
      message: "Successfully subscribed!",
      discount_code: realDiscountCode,
      subscriber_id: subscriber.id,
      shopify_discount_id: shopifyDiscountId,
      shopify_discount_created: discountCreationSuccess,
      code_validated: validateDiscountCode(realDiscountCode),
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
