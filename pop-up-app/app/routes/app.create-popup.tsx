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
  Button,
  BlockStack,
  InlineStack,
  Text,
  Tabs,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// PopupPreview Component for the full page
function PopupPreview({ settings }: { settings: any }) {
  const [isVisible, setIsVisible] = useState(true);

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

  const previewStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '600px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e1e3e5',
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
        
        <div style={previewStyles}>
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
                  Get {settings.discountPercentage || 20}% Discount
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

// 🚀 Loader to fetch current settings
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
          title: "Get 23% Off Your First Order!",
          description: "an exclusive discount code get it boy",
          discountPercentage: 20,
          position: "center",
          triggerType: "scroll",
          delaySeconds: 1,
          frequency: "every_visit",
          backgroundColor: "#ffffff",
          textColor: "#333333",
          buttonColor: "#007cba",
        }
      });
    }

    return json({ settings });

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
      const settingsData = {
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
      };

      const updatedSettings = await prisma.popupSettings.upsert({
        where: { shopDomain: shop },
        update: settingsData,
        create: {
          shopDomain: shop,
          ...settingsData
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

export default function CreatePopup() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
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

  const { settings } = data;

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

  const subTabs = [
    { id: "style", content: "Style" },
    { id: "rules", content: "Rules" },
  ];

  return (
    <Page>
      <TitleBar title="Create Pop-up Setting" />
      
      <Layout>
        {(fetcher.data as any)?.success && (
          <Layout.Section>
            <Banner tone="success" title="Settings updated successfully!" />
          </Layout.Section>
        )}
        
        {(fetcher.data as any)?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Error updating settings">
              <p>{(fetcher.data as any).error}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* Left Column - Settings with Sub-tabs */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">
                Configure Your Pop-up
              </Text>
              
              <Tabs tabs={subTabs} selected={selectedSubTab} onSelect={setSelectedSubTab}>
                {/* Style Sub-tab */}
                {selectedSubTab === 0 && (
                  <Card>
                    <BlockStack gap="400">
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

                {/* Rules Sub-tab */}
                {selectedSubTab === 1 && (
                  <Card>
                    <BlockStack gap="400">
                      <FormLayout>
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
    </Page>
  );
}