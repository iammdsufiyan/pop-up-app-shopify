import { useCallback, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  RangeSlider,
  ColorPicker,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DataTable,
  Tabs,
  Banner,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// 🚀 Loader to fetch current settings and stats
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Get current popup settings
    let settings = await prisma.popupSettings.findUnique({
      where: { shopDomain: shop }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.popupSettings.create({
        data: {
          shopDomain: shop,
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

    // Get subscriber statistics
    const totalSubscribers = await prisma.popupSubscriber.count({
      where: { shopDomain: shop, isActive: true }
    });

    const todaySubscribers = await prisma.popupSubscriber.count({
      where: {
        shopDomain: shop,
        isActive: true,
        subscribedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const thisWeekSubscribers = await prisma.popupSubscriber.count({
      where: {
        shopDomain: shop,
        isActive: true,
        subscribedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const recentSubscribers = await prisma.popupSubscriber.findMany({
      where: { shopDomain: shop, isActive: true },
      orderBy: { subscribedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        discountCode: true,
        subscribedAt: true,
        usedDiscount: true,
      }
    });

    return json({
      settings,
      stats: {
        total: totalSubscribers,
        today: todaySubscribers,
        thisWeek: thisWeekSubscribers,
        recent: recentSubscribers,
      }
    });

  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Failed to load data" }, { status: 500 });
  }
};

// 🚀 Action to update settings
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "update_settings") {
      const updatedSettings = await prisma.popupSettings.upsert({
        where: { shopDomain: shop },
        update: {
          isEnabled: formData.get("isEnabled") === "true",
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          discountPercentage: parseInt(formData.get("discountPercentage") as string),
          position: formData.get("position") as string,
          triggerType: formData.get("triggerType") as string,
          delaySeconds: parseInt(formData.get("delaySeconds") as string),
          frequency: formData.get("frequency") as string,
          backgroundColor: formData.get("backgroundColor") as string,
          textColor: formData.get("textColor") as string,
          buttonColor: formData.get("buttonColor") as string,
        },
        create: {
          shopDomain: shop,
          isEnabled: formData.get("isEnabled") === "true",
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          discountPercentage: parseInt(formData.get("discountPercentage") as string),
          position: formData.get("position") as string,
          triggerType: formData.get("triggerType") as string,
          delaySeconds: parseInt(formData.get("delaySeconds") as string),
          frequency: formData.get("frequency") as string,
          backgroundColor: formData.get("backgroundColor") as string,
          textColor: formData.get("textColor") as string,
          buttonColor: formData.get("buttonColor") as string,
        }
      });

      return json({ success: true, settings: updatedSettings });
    }

    return json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Failed to update settings" }, { status: 500 });
  }
};

export default function PopupSettings() {
  const { settings, stats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedTab, setSelectedTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
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
  });

  const handleSubmit = useCallback(() => {
    const form = new FormData();
    form.append("action", "update_settings");
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
    fetcher.submit(form, { method: "POST" });
  }, [formData, fetcher]);

  const isLoading = fetcher.state === "submitting";

  // Prepare data for subscriber table
  const subscriberRows = stats.recent.map((subscriber) => [
    subscriber.email,
    subscriber.phone || "—",
    subscriber.discountCode,
    new Date(subscriber.subscribedAt).toLocaleDateString(),
    subscriber.usedDiscount ? (
      <Badge status="success">Used</Badge>
    ) : (
      <Badge>Unused</Badge>
    ),
  ]);

  const tabs = [
    { id: "settings", content: "Pop-up Settings" },
    { id: "analytics", content: "Analytics" },
    { id: "subscribers", content: "Subscribers" },
  ];

  return (
    <Page>
      <TitleBar title="Pop-up Settings" />
      
      <Layout>
        <Layout.Section>
          {fetcher.data?.success && (
            <Banner status="success" title="Settings updated successfully!" />
          )}
          
          {fetcher.data?.error && (
            <Banner status="critical" title="Error updating settings">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}

          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            {/* Settings Tab */}
            {selectedTab === 0 && (
              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">
                    Configure Your Pop-up
                  </Text>
                  
                  <FormLayout>
                    <FormLayout.Group>
                      <Select
                        label="Pop-up Status"
                        options={[
                          { label: "Enabled", value: "true" },
                          { label: "Disabled", value: "false" },
                        ]}
                        value={formData.isEnabled.toString()}
                        onChange={(value) => setFormData({ ...formData, isEnabled: value === "true" })}
                      />
                      
                      <Select
                        label="Position"
                        options={[
                          { label: "Center", value: "center" },
                          { label: "Right Side", value: "right" },
                          { label: "Left Side", value: "left" },
                          { label: "Bottom Right", value: "bottom-right" },
                        ]}
                        value={formData.position}
                        onChange={(value) => setFormData({ ...formData, position: value })}
                      />
                    </FormLayout.Group>

                    <TextField
                      label="Pop-up Title"
                      value={formData.title}
                      onChange={(value) => setFormData({ ...formData, title: value })}
                      helpText="Main heading for your pop-up"
                    />

                    <TextField
                      label="Description"
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      multiline={3}
                      helpText="Description text that appears below the title"
                    />

                    <FormLayout.Group>
                      <RangeSlider
                        label={`Discount Percentage: ${formData.discountPercentage}%`}
                        value={formData.discountPercentage}
                        min={1}
                        max={50}
                        onChange={(value) => setFormData({ ...formData, discountPercentage: value })}
                      />
                      
                      <RangeSlider
                        label={`Delay: ${formData.delaySeconds} seconds`}
                        value={formData.delaySeconds}
                        min={1}
                        max={60}
                        onChange={(value) => setFormData({ ...formData, delaySeconds: value })}
                      />
                    </FormLayout.Group>

                    <FormLayout.Group>
                      <Select
                        label="Trigger Type"
                        options={[
                          { label: "On Page Load", value: "page_load" },
                          { label: "On Exit Intent", value: "exit_intent" },
                          { label: "After Time Delay", value: "time_delay" },
                          { label: "On Scroll", value: "scroll" },
                        ]}
                        value={formData.triggerType}
                        onChange={(value) => setFormData({ ...formData, triggerType: value })}
                      />
                      
                      <Select
                        label="Frequency"
                        options={[
                          { label: "Once per session", value: "once_per_session" },
                          { label: "Once per day", value: "once_per_day" },
                          { label: "Every visit", value: "every_visit" },
                          { label: "Once per week", value: "once_per_week" },
                        ]}
                        value={formData.frequency}
                        onChange={(value) => setFormData({ ...formData, frequency: value })}
                      />
                    </FormLayout.Group>

                    <Text as="h3" variant="headingMd">Colors</Text>
                    <FormLayout.Group>
                      <Box>
                        <Text as="p" variant="bodyMd">Background Color</Text>
                        <ColorPicker
                          color={formData.backgroundColor}
                          onChange={(color) => setFormData({ ...formData, backgroundColor: color.hex })}
                        />
                      </Box>
                      
                      <Box>
                        <Text as="p" variant="bodyMd">Text Color</Text>
                        <ColorPicker
                          color={formData.textColor}
                          onChange={(color) => setFormData({ ...formData, textColor: color.hex })}
                        />
                      </Box>
                      
                      <Box>
                        <Text as="p" variant="bodyMd">Button Color</Text>
                        <ColorPicker
                          color={formData.buttonColor}
                          onChange={(color) => setFormData({ ...formData, buttonColor: color.hex })}
                        />
                      </Box>
                    </FormLayout.Group>

                    <InlineStack align="end">
                      <Button
                        variant="primary"
                        loading={isLoading}
                        onClick={handleSubmit}
                      >
                        Save Settings
                      </Button>
                    </InlineStack>
                  </FormLayout>
                </BlockStack>
              </Card>
            )}

            {/* Analytics Tab */}
            {selectedTab === 1 && (
              <BlockStack gap="500">
                <Layout>
                  <Layout.Section variant="oneThird">
                    <Card>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingMd">Total Subscribers</Text>
                        <Text as="p" variant="heading2xl">{stats.total}</Text>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                  
                  <Layout.Section variant="oneThird">
                    <Card>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingMd">Today</Text>
                        <Text as="p" variant="heading2xl">{stats.today}</Text>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                  
                  <Layout.Section variant="oneThird">
                    <Card>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingMd">This Week</Text>
                        <Text as="p" variant="heading2xl">{stats.thisWeek}</Text>
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                </Layout>
              </BlockStack>
            )}

            {/* Subscribers Tab */}
            {selectedTab === 2 && (
              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">Recent Subscribers</Text>
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                    headings={['Email', 'Phone', 'Discount Code', 'Date', 'Status']}
                    rows={subscriberRows}
                  />
                </BlockStack>
              </Card>
            )}
          </Tabs>
        </Layout.Section>
      </Layout>
    </Page>
  );
}