import { useCallback, useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Modal,
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
} from "@shopify/polaris";

// PopupPreview Component for the modal
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
    height: '85vh',
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
                {settings.title || "Get 10% Off Your First Order!"}
              </h2>
              
              <p style={{
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: '1.5',
                color: settings.textColor || '#333333'
              }}>
                {settings.description || "Enter your email to receive an exclusive discount code"}
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
                  {settings.discountType === "percentage_off" && `Get ${settings.discountPercentage || 10}% Discount`}
                  {settings.discountType === "fixed_amount" && `Get $${settings.discountAmount || 10} Off`}
                  {settings.discountType === "free_shipping" && "Get Free Shipping"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <BlockStack gap="200">
          <Text as="h4" variant="headingSm">Preview Settings</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div><strong>Position:</strong> {settings.position || 'center'}</div>
            <div><strong>Trigger:</strong> {settings.triggerType?.replace('_', ' ') || 'page load'}</div>
            <div><strong>Delay:</strong> {settings.delaySeconds || 5}s</div>
            <div><strong>Frequency:</strong> {settings.frequency?.replace('_', ' ') || 'once per session'}</div>
          </div>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

interface PopupSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: any;
}

export default function PopupSettingsModal({ open, onClose, settings }: PopupSettingsModalProps) {
  const fetcher = useFetcher();
  const [selectedSubTab, setSelectedSubTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    isEnabled: settings?.isEnabled || true,
    title: settings?.title || "Get 23% Off Your First Order!",
    description: settings?.description || "an exclusive discount code get it boy",
    discountType: settings?.discountType || "percentage_off",
    discountPercentage: settings?.discountPercentage || 20,
    discountAmount: settings?.discountAmount || 10.0,
    discountCode: settings?.discountCode || "WELCOME10",
    locationTargeting: settings?.locationTargeting || "all",
    targetCountries: settings?.targetCountries || "",
    scheduleType: settings?.scheduleType || "always",
    startDate: settings?.startDate || "",
    endDate: settings?.endDate || "",
    startTime: settings?.startTime || "",
    endTime: settings?.endTime || "",
    pageRules: settings?.pageRules || "all_pages",
    specificPages: settings?.specificPages || "",
    position: settings?.position || "center",
    triggerType: settings?.triggerType || "scroll",
    delaySeconds: settings?.delaySeconds || 1,
    frequency: settings?.frequency || "every_visit",
    backgroundColor: settings?.backgroundColor || "#ffffff",
    textColor: settings?.textColor || "#333333",
    buttonColor: settings?.buttonColor || "#007cba",
  });

  const handleSubmit = useCallback(() => {
    const form = new FormData();
    form.append("action", "update_settings");
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
    fetcher.submit(form, { method: "POST", action: "/app/popup-settings" });
  }, [formData, fetcher]);

  const isLoading = fetcher.state === "submitting";

  const subTabs = [
    { id: "rules", content: "Rules" },
    { id: "style", content: "Style" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configure Your Pop-up"
      primaryAction={{
        content: 'Save Settings',
        onAction: handleSubmit,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <div style={{ height: '90vh', width: '100%', padding: '0', maxWidth: 'none' }}>
          <Layout>
            {/* Left Column - Settings with Sub-tabs */}
            <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="500">
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
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Right Column - Live Preview */}
          <Layout.Section variant="oneHalf">
            <PopupPreview settings={formData} />
          </Layout.Section>
        </Layout>
      </div>
    </Modal.Section>
  </Modal>
);
}