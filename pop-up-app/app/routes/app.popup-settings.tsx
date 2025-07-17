import { useCallback, useState, useEffect } from "react";
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

// PopupPreview Component
function PopupPreview({ settings }: { settings: any }) {
  const [isVisible, setIsVisible] = useState(true);

  const previewStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '400px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid #e1e3e5',
  };

  const popupStyles = {
    backgroundColor: settings.backgroundColor || '#ffffff',
    color: settings.textColor || '#333333',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '320px',
    width: '90%',
    position: 'relative' as const,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    opacity: isVisible ? 1 : 0.5,
    transition: 'all 0.3s ease',
  };

  const buttonStyles = {
    backgroundColor: settings.buttonColor || '#007cba',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginTop: '15px',
  };

  const inputStyles = {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    marginBottom: '10px',
  };

  const closeButtonStyles = {
    position: 'absolute' as const,
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: settings.textColor || '#333333',
    opacity: 0.7,
  };

  const getPositionStyles = (position: string) => {
    const baseStyles = {
      position: 'absolute' as const,
      backgroundColor: settings.backgroundColor || '#ffffff',
      color: settings.textColor || '#333333',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '320px',
      width: '90%',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      opacity: isVisible ? 1 : 0.5,
      transition: 'all 0.3s ease',
      zIndex: 10,
    };

    switch (position) {
      case 'center':
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'right':
        return { ...baseStyles, right: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'left':
        return { ...baseStyles, left: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'bottom-right':
        return { ...baseStyles, right: '20px', bottom: '20px', transform: 'none' };
      default:
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const enhancedPreviewStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '600px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e1e3e5',
  };

  return (
    <Card>
      <BlockStack gap="400">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text as="h3" variant="headingMd">Live Preview</Text>
          <Button
            size="micro"
            onClick={() => setIsVisible(!isVisible)}
            variant={isVisible ? "primary" : "secondary"}
          >
            {isVisible ? 'Hide' : 'Show'} Popup
          </Button>
        </div>
        
        <div style={enhancedPreviewStyles}>
          <div style={getPositionStyles(settings.position)}>
            <button style={closeButtonStyles}>&times;</button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: settings.textColor || '#333333'
              }}>
                {settings.title || "Get 23% Off Your First Order!"}
              </h2>
              
              <p style={{
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: '1.5',
                color: settings.textColor || '#333333'
              }}>
                {settings.description || "an exclusive discount code get it boy"}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  style={inputStyles}
                  readOnly
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  style={inputStyles}
                  readOnly
                />
                <button style={buttonStyles}>
                  {settings.discountType === "percentage_off" && `Get ${settings.discountPercentage || 20}% Discount`}
                  {settings.discountType === "fixed_amount" && `Get $${settings.discountAmount || 10} Off`}
                  {settings.discountType === "free_shipping" && "Get Free Shipping"}
                  {!settings.discountType && `Get ${settings.discountPercentage || 20}% Discount`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <BlockStack gap="200">
          <Text as="h4" variant="headingSm">Preview Settings</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div><strong>Position:</strong> {settings.position || 'center'}</div>
            <div><strong>Trigger:</strong> {settings.triggerType?.replace('_', ' ') || 'scroll'}</div>
            <div><strong>Delay:</strong> {settings.delaySeconds || 1}s</div>
            <div><strong>Frequency:</strong> {settings.frequency?.replace('_', ' ') || 'every visit'}</div>
          </div>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

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
          discountType: "percentage_off",
          discountPercentage: 10,
          discountAmount: 10.0,
          discountCode: "WELCOME10",
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
          triggerType: "page_load",
          delaySeconds: 5,
          frequency: "once_per_session",
          backgroundColor: "#ffffff",
          textColor: "#333333",
          buttonColor: "#007cba",
        } as any
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

  console.log(`🔧 Popup settings action called for shop: ${shop}`);

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    console.log(`🔧 Action type: ${action}`);

    if (action === "update_settings") {
      const settingsData = {
        isEnabled: formData.get("isEnabled") === "true",
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        discountType: formData.get("discountType") as string,
        discountPercentage: parseInt(formData.get("discountPercentage") as string),
        discountAmount: parseFloat(formData.get("discountAmount") as string),
        discountCode: formData.get("discountCode") as string,
        locationTargeting: formData.get("locationTargeting") as string,
        targetCountries: formData.get("targetCountries") as string,
        scheduleType: formData.get("scheduleType") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        pageRules: formData.get("pageRules") as string,
        specificPages: formData.get("specificPages") as string,
        position: formData.get("position") as string,
        triggerType: formData.get("triggerType") as string,
        delaySeconds: parseInt(formData.get("delaySeconds") as string),
        frequency: formData.get("frequency") as string,
        backgroundColor: formData.get("backgroundColor") as string,
        textColor: formData.get("textColor") as string,
        buttonColor: formData.get("buttonColor") as string,
      };

      console.log(`🔧 Settings data to save:`, settingsData);

      const updatedSettings = await prisma.popupSettings.upsert({
        where: { shopDomain: shop },
        update: settingsData,
        create: {
          shopDomain: shop,
          ...settingsData
        }
      });

      console.log(`✅ Settings saved successfully:`, updatedSettings);

      return json({ success: true, settings: updatedSettings });
    }

    console.log(`❌ Invalid action: ${action}`);
    return json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("❌ Action error:", error);
    return json({ error: "Failed to update settings" }, { status: 500 });
  }
};

export default function PopupSettings() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSubTab, setSelectedSubTab] = useState(0);

  // Handle potential error state
  if ('error' in data) {
    return (
      <Page>
        <Banner tone="critical" title="Error loading settings">
          <p>{data.error}</p>
        </Banner>
      </Page>
    );
  }

  const { settings, stats } = data;

  // Form state
  const [formData, setFormData] = useState({
    isEnabled: settings.isEnabled,
    title: settings.title,
    description: settings.description,
    discountType: (settings as any).discountType || "percentage_off",
    discountPercentage: settings.discountPercentage,
    discountAmount: (settings as any).discountAmount || 10.0,
    discountCode: (settings as any).discountCode || "WELCOME10",
    locationTargeting: (settings as any).locationTargeting || "all",
    targetCountries: (settings as any).targetCountries || "",
    scheduleType: (settings as any).scheduleType || "always",
    startDate: (settings as any).startDate || "",
    endDate: (settings as any).endDate || "",
    startTime: (settings as any).startTime || "",
    endTime: (settings as any).endTime || "",
    pageRules: (settings as any).pageRules || "all_pages",
    specificPages: (settings as any).specificPages || "",
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
  const subscriberRows = stats.recent.map((subscriber: any) => [
    subscriber.email,
    subscriber.phone || "—",
    subscriber.discountCode,
    new Date(subscriber.subscribedAt).toLocaleDateString(),
    subscriber.usedDiscount ? (
      <Badge tone="success">Used</Badge>
    ) : (
      <Badge>Unused</Badge>
    ),
  ]);

  const tabs = [
    { id: "settings", content: "Pop-up Settings" },
    { id: "analytics", content: "Analytics" },
    { id: "subscribers", content: "Subscribers" },
  ];

  const subTabs = [
    { id: "rules", content: "Rules" },
    { id: "style", content: "Style" },
  ];

  return (
    <Page>
      <TitleBar title="Pop-up Settings" />
      
      <Layout>
        <Layout.Section>
          {(fetcher.data as any)?.success && (
            <Banner tone="success" title="Settings updated successfully!" />
          )}
          
          {(fetcher.data as any)?.error && (
            <Banner tone="critical" title="Error updating settings">
              <p>{(fetcher.data as any).error}</p>
            </Banner>
          )}

          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            {/* Settings Tab with Sub-tabs and Preview */}
            {selectedTab === 0 && (
              <Layout>
                {/* Left Column - Settings with Sub-tabs */}
                <Layout.Section variant="oneHalf">
                  <Card>
                    <BlockStack gap="500">
                      <Text as="h2" variant="headingMd">
                        Configure Your Pop-up
                      </Text>
                      
                      <Tabs tabs={subTabs} selected={selectedSubTab} onSelect={setSelectedSubTab}>
                        {/* Rules Sub-tab */}
                        {selectedSubTab === 0 && (
                          <Card>
                            <BlockStack gap="400">
                              {/* Toggle Button at the top */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
                                <div>
                                  <Text as="h3" variant="headingMd">Pop-up Status</Text>
                                  <Text as="p" variant="bodyMd" tone="subdued">
                                    {formData.isEnabled ? 'Pop-up is currently active and visible to visitors' : 'Pop-up is currently disabled and hidden from visitors'}
                                  </Text>
                                </div>
                                <Button
                                  variant={formData.isEnabled ? "primary" : "secondary"}
                                  onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
                                >
                                  {formData.isEnabled ? 'ON' : 'OFF'}
                                </Button>
                              </div>

                              <FormLayout>
                                <TextField
                                  label="Pop-up Title"
                                  value={formData.title}
                                  onChange={(value) => setFormData({ ...formData, title: value })}
                                  helpText="Main heading for your pop-up"
                                  autoComplete="off"
                                />

                                <TextField
                                  label="Description"
                                  value={formData.description}
                                  onChange={(value) => setFormData({ ...formData, description: value })}
                                  multiline={3}
                                  helpText="Description text that appears below the title"
                                  autoComplete="off"
                                />

                                <RangeSlider
                                  label={`Discount Percentage: ${formData.discountPercentage}%`}
                                  value={formData.discountPercentage}
                                  min={1}
                                  max={50}
                                  onChange={(value) => setFormData({ ...formData, discountPercentage: Array.isArray(value) ? value[0] : value })}
                                />
                                
                                <Text as="h3" variant="headingMd">Discount Settings</Text>
                                
                                <Select
                                  label="Discount Type"
                                  options={[
                                    { label: "Percentage Off", value: "percentage_off" },
                                    { label: "Fixed Amount", value: "fixed_amount" },
                                    { label: "Free Shipping", value: "free_shipping" },
                                  ]}
                                  value={formData.discountType}
                                  onChange={(value) => setFormData({ ...formData, discountType: value })}
                                  helpText="Choose the type of discount to offer"
                                />

                                {formData.discountType === "percentage_off" && (
                                  <RangeSlider
                                    label={`Discount Percentage: ${formData.discountPercentage}%`}
                                    value={formData.discountPercentage}
                                    min={1}
                                    max={50}
                                    onChange={(value) => setFormData({ ...formData, discountPercentage: Array.isArray(value) ? value[0] : value })}
                                  />
                                )}

                                {formData.discountType === "fixed_amount" && (
                                  <TextField
                                    label="Discount Amount ($)"
                                    type="number"
                                    value={formData.discountAmount.toString()}
                                    onChange={(value) => setFormData({ ...formData, discountAmount: parseFloat(value) || 0 })}
                                    helpText="Enter the fixed discount amount in dollars"
                                    autoComplete="off"
                                  />
                                )}

                                {formData.discountType === "free_shipping" && (
                                  <Text as="p" variant="bodyMd" tone="subdued">
                                    Free shipping will be applied automatically. No additional configuration needed.
                                  </Text>
                                )}

                                <TextField
                                  label="Discount Code"
                                  value={formData.discountCode}
                                  onChange={(value) => setFormData({ ...formData, discountCode: value })}
                                  helpText="The discount code that customers will receive (e.g., WELCOME10, SAVE20)"
                                  autoComplete="off"
                                />

                                <Text as="h3" variant="headingMd">Location Targeting</Text>
                                
                                <Select
                                  label="Target Audience"
                                  options={[
                                    { label: "All Countries", value: "all" },
                                    { label: "Specific Countries", value: "specific_countries" },
                                  ]}
                                  value={formData.locationTargeting}
                                  onChange={(value) => setFormData({ ...formData, locationTargeting: value })}
                                  helpText="Choose whether to show popup to all visitors or only specific countries"
                                />

                                {formData.locationTargeting === "specific_countries" && (
                                  <TextField
                                    label="Target Countries"
                                    value={formData.targetCountries}
                                    onChange={(value) => setFormData({ ...formData, targetCountries: value })}
                                    helpText="Enter country codes separated by commas (e.g., US, CA, GB, AU, DE, FR, IN)"
                                    placeholder="US, CA, GB, AU, DE, FR, IN"
                                    autoComplete="off"
                                  />
                                )}

                                <Text as="h3" variant="headingMd">Scheduling</Text>
                                
                                <Select
                                  label="Schedule Type"
                                  options={[
                                    { label: 'Always Active', value: 'always' },
                                    { label: 'Date Range', value: 'date_range' },
                                    { label: 'Time Period', value: 'time_period' },
                                    { label: 'Date Range with Time', value: 'date_time_range' }
                                  ]}
                                  value={formData.scheduleType}
                                  onChange={(value) => setFormData({ ...formData, scheduleType: value })}
                                  helpText="Choose when the popup should be active"
                                />

                                {(formData.scheduleType === 'date_range' || formData.scheduleType === 'date_time_range') && (
                                  <InlineStack gap="400">
                                    <TextField
                                      label="Start Date"
                                      type="date"
                                      value={formData.startDate}
                                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                                      autoComplete="off"
                                    />
                                    <TextField
                                      label="End Date"
                                      type="date"
                                      value={formData.endDate}
                                      onChange={(value) => setFormData({ ...formData, endDate: value })}
                                      autoComplete="off"
                                    />
                                  </InlineStack>
                                )}

                                {(formData.scheduleType === 'time_period' || formData.scheduleType === 'date_time_range') && (
                                  <InlineStack gap="400">
                                    <TextField
                                      label="Start Time"
                                      type="time"
                                      value={formData.startTime}
                                      onChange={(value) => setFormData({ ...formData, startTime: value })}
                                      autoComplete="off"
                                    />
                                    <TextField
                                      label="End Time"
                                      type="time"
                                      value={formData.endTime}
                                      onChange={(value) => setFormData({ ...formData, endTime: value })}
                                      autoComplete="off"
                                    />
                                  </InlineStack>
                                )}

                                <Text as="h3" variant="headingMd">Page Rules</Text>
                                
                                <Select
                                  label="Display popup on"
                                  options={[
                                    { label: "Show on any page", value: "all_pages" },
                                    { label: "Show on specific page", value: "specific_pages" },
                                  ]}
                                  value={formData.pageRules}
                                  onChange={(value) => setFormData({ ...formData, pageRules: value })}
                                  helpText="Choose which pages the popup should appear on"
                                />

                                {formData.pageRules === "specific_pages" && (
                                  <TextField
                                    label="Specific Pages"
                                    value={formData.specificPages}
                                    onChange={(value) => setFormData({ ...formData, specificPages: value })}
                                    helpText="Enter page URLs separated by commas (e.g., /products, /collections/all, /pages/about)"
                                    placeholder="/products, /collections/all, /pages/about"
                                    multiline={3}
                                    autoComplete="off"
                                  />
                                )}
                              </FormLayout>
                            </BlockStack>
                          </Card>
                        )}

                        {/* Style Sub-tab */}
                        {selectedSubTab === 1 && (
                          <Card>
                            <BlockStack gap="400">
                              <FormLayout>
                                <Text as="h3" variant="headingMd">Display Settings</Text>
                                
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

                                <RangeSlider
                                  label={`Delay: ${formData.delaySeconds} seconds`}
                                  value={formData.delaySeconds}
                                  min={1}
                                  max={60}
                                  onChange={(value) => setFormData({ ...formData, delaySeconds: Array.isArray(value) ? value[0] : value })}
                                />

                                <Text as="h3" variant="headingMd">Colors</Text>
                                <TextField
                                  label="Background Color"
                                  value={formData.backgroundColor}
                                  onChange={(value) => setFormData({ ...formData, backgroundColor: value })}
                                  helpText="Hex color code (e.g., #ffffff)"
                                  autoComplete="off"
                                />
                                
                                <TextField
                                  label="Text Color"
                                  value={formData.textColor}
                                  onChange={(value) => setFormData({ ...formData, textColor: value })}
                                  helpText="Hex color code (e.g., #333333)"
                                  autoComplete="off"
                                />
                                
                                <TextField
                                  label="Button Color"
                                  value={formData.buttonColor}
                                  onChange={(value) => setFormData({ ...formData, buttonColor: value })}
                                  helpText="Hex color code (e.g., #007cba)"
                                  autoComplete="off"
                                />
                              </FormLayout>
                            </BlockStack>
                          </Card>
                        )}
                      </Tabs>

                      <InlineStack align="end">
                        <Button
                          variant="primary"
                          loading={isLoading}
                          onClick={handleSubmit}
                        >
                          Save Settings
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Layout.Section>

                {/* Right Column - Live Preview */}
                <Layout.Section variant="oneHalf">
                  <PopupPreview settings={formData} />
                </Layout.Section>
              </Layout>
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