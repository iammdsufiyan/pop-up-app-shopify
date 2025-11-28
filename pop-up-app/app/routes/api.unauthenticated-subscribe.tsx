import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { DISCOUNT_QUERIES, createDiscountCodeInput, generateUniqueDiscountCode, type DiscountCodeCreateResponse } from "../utils/graphql";

// 🚀 Unauthenticated API endpoint to handle pop-up form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const shopDomain = request.headers.get("x-shopify-shop-domain");
  if (!shopDomain) {
    return json({ error: "Shop domain is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { email, phone, block_id } = body;

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    const uniqueDiscountCode = generateUniqueDiscountCode();
    const { admin } = await unauthenticated.admin(shopDomain);

    const popupSettings = await prisma.popupSettings.findUnique({ where: { shopDomain } });
    const discountPercentage = popupSettings?.discountPercentage || 10;

    const discountInput = createDiscountCodeInput(uniqueDiscountCode, discountPercentage, `Popup Discount - ${email}`);
    const response = await admin.graphql(DISCOUNT_QUERIES.CREATE_DISCOUNT_CODE, {
      variables: { basicCodeDiscount: discountInput },
    });

    const result = await response.json() as { data: DiscountCodeCreateResponse };

    if (result.data?.discountCodeBasicCreate?.codeDiscountNode) {
      const subscriber = await prisma.popupSubscriber.create({
        data: {
          email,
          phone: phone || null,
          discountCode: uniqueDiscountCode,
          blockId: block_id,
          shopDomain,
        },
      });

      return json({
        success: true,
        discount_code: uniqueDiscountCode,
      }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    } else {
      console.error("Failed to create Shopify discount code:", result.data?.discountCodeBasicCreate?.userErrors);
      return json({ error: "Failed to create discount code" }, { status: 500 });
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return json({ error: "Failed to process subscription" }, { status: 500 });
  }
};