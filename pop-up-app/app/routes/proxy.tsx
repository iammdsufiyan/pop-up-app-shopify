import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { DISCOUNT_QUERIES, createDiscountCodeInput, generateUniqueDiscountCode } from "../utils/graphql";
import type { DiscountCodeCreateResponse } from "../utils/graphql";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const block_id = searchParams.get("block_id");
  const shopDomain = searchParams.get("shop");

  if (!email || !shopDomain) {
    return json({ error: "Email and shop are required" }, { status: 400 });
  }

  try {
    const { admin, session } = await authenticate.public.appProxy(request);

    if (!admin || !session) {
      return json({ error: "Could not authenticate request." }, { status: 401 });
    }

    const uniqueDiscountCode = generateUniqueDiscountCode();
    const popupSettings = await prisma.popupSettings.findUnique({ where: { shopDomain: session.shop } });
    const discountPercentage = popupSettings?.discountPercentage || 10;
    const discountInput = createDiscountCodeInput(uniqueDiscountCode, discountPercentage, `Popup Discount - ${email}`);

    const response = await admin.graphql(DISCOUNT_QUERIES.CREATE_DISCOUNT_CODE, {
      variables: { basicCodeDiscount: discountInput },
    });
    const result = await response.json() as { data: DiscountCodeCreateResponse };

    if (result.data?.discountCodeBasicCreate?.codeDiscountNode) {
      await prisma.popupSubscriber.create({
        data: {
          email,
          phone: phone || null,
          discountCode: uniqueDiscountCode,
          blockId: block_id,
          shopDomain: session.shop,
        },
      });

      return json({ success: true, discount_code: uniqueDiscountCode }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    } else {
      console.error("Failed to create Shopify discount code:", result.data?.discountCodeBasicCreate?.userErrors);
      return json({ error: "Failed to create discount code" }, { status: 500 });
    }
  } catch (error) {
    console.error("Proxy subscription error:", error);
    return json({ error: "Failed to process subscription" }, { status: 500 });
  }
};