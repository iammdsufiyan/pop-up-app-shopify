import { useState } from "react";
import { Page, Button } from "@shopify/polaris";
import PopupSettingsModal from "../components/PopupSettingsModal";
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.popupSettings.findUnique({
    where: { shopDomain: shop },
  });

  if (!settings) {
    settings = await prisma.popupSettings.create({
      data: {
        shopDomain: shop,
        isEnabled: true,
        title: "Get 23% Off Your First Order!",
        description: "an exclusive discount code get it boy",
        discountType: "percentage_off",
        discountPercentage: 20,
        discountAmount: 10.0,
        discountCode: "WELCOME20",
        locationTargeting: "all",
        targetCountries: "",
        scheduleType: "always",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        pageRules: "all_pages",
        specificPages: "",
        position: "center",
        triggerType: "scroll",
        delaySeconds: 1,
        frequency: "every_visit",
        backgroundColor: "#ffffff",
        textColor: "#333333",
        buttonColor: "#007cba",
      } as any,
    });
  }

  return { settings };
};

export default function CreatePopupPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { settings } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Button onClick={() => setIsModalOpen(true)}>Configure Pop-up</Button>
      <PopupSettingsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
      />
    </Page>
  );
}