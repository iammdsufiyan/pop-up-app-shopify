import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { DISCOUNT_QUERIES, createDiscountCodeInput, generateUniqueDiscountCode, validateDiscountCode, type DiscountCodeCreateResponse } from "../utils/graphql";

// This loader is not used in the current version of the application.
// export const loader = async ({ request }: ActionFunctionArgs) => {
//   // ...
// };

// 🚀 API endpoint to handle pop-up form submissions
export const action = async ({ request }: ActionFunctionArgs) => {

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    console.log("🚀 API Subscribe endpoint called!");
    
    const shopDomain = request.headers.get("x-shopify-shop-domain") || "booksss12345.myshopify.com";
    console.log("🏪 Shop domain:", shopDomain);

    const body = await request.json();
    const { email, phone, block_id } = body;
    console.log("📧 Received data:", { email, phone, block_id });

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    const uniqueDiscountCode = generateUniqueDiscountCode();
    console.log("🎟️ Generated unique discount code:", uniqueDiscountCode);

    let realDiscountCode = uniqueDiscountCode;
    let shopifyDiscountId = null;
    let discountCreationSuccess = false;

    try {
      const { admin, session } = await authenticate.public.appProxy(request);
      if (!admin || !session) {
        console.log("⚠️ Could not authenticate with Shopify Admin API via App Proxy.");
        // Fallback or error response
      } else {
        const popupSettings = await prisma.popupSettings.findUnique({ where: { shopDomain: session.shop } });
        const discountPercentage = popupSettings?.discountPercentage || 10;
        console.log(`🏪 Creating ${discountPercentage}% discount code in Shopify...`);

        const discountInput = createDiscountCodeInput(uniqueDiscountCode, discountPercentage, `Popup Discount - ${email}`);
        const response = await admin.graphql(DISCOUNT_QUERIES.CREATE_DISCOUNT_CODE, {
          variables: { basicCodeDiscount: discountInput }
        });
        const result = await response.json() as { data: DiscountCodeCreateResponse };

        if (result.data?.discountCodeBasicCreate?.codeDiscountNode) {
          realDiscountCode = uniqueDiscountCode;
          shopifyDiscountId = result.data.discountCodeBasicCreate.codeDiscountNode.id;
          discountCreationSuccess = true;
          console.log("✅ Successfully created Shopify discount code:", realDiscountCode);
        } else {
          console.log("⚠️ Failed to create Shopify discount code:", result.data?.discountCodeBasicCreate?.userErrors);
        }
      }
    } catch (authError) {
      console.log("⚠️ Could not authenticate with Shopify Admin API:", authError);
    }

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

    return json({
      success: true,
      message: "Successfully subscribed!",
      discount_code: realDiscountCode,
      subscriber_id: subscriber.id,
      shopify_discount_id: shopifyDiscountId,
      shopify_discount_created: discountCreationSuccess,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });

  } catch (error) {
    console.error("❌ Subscription error:", error);
    return json(
      { error: "Failed to process subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
};
