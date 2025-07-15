import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  BlockStack,
  Text,
  Banner,
  InlineStack,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ message: "Debug Settings Page Loaded" });
};

export default function DebugSettings() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "Get 21% Off Your First Order!",
    description: "Enter your email to receive an exclusive discount code",
    discountPercentage: 21,
    position: "center",
    backgroundColor: "#112255",
    textColor: "#333333",
    buttonColor: "#007cbb",
  });

  const testGetSettings = async () => {
    setIsLoading(true);
    setResult("Testing GET settings...");
    
    try {
      const response = await fetch(`/api/popup-settings?shopDomain=booksss12345.myshopify.com`);
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ GET Settings Success: ${JSON.stringify(data.settings, null, 2)}`);
        
        // Update form with current settings
        const settings = data.settings;
        setFormData({
          title: settings.title || '',
          description: settings.description || '',
          discountPercentage: settings.discountPercentage || 10,
          position: settings.position || 'center',
          backgroundColor: settings.backgroundColor || '#ffffff',
          textColor: settings.textColor || '#333333',
          buttonColor: settings.buttonColor || '#007cba',
        });
      } else {
        setResult(`❌ GET Settings Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ GET Settings Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsLoading(false);
  };

  const testUpdateSettings = async () => {
    setIsLoading(true);
    setResult("Testing UPDATE settings...");
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('shopDomain', 'booksss12345.myshopify.com');
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('discountPercentage', formData.discountPercentage.toString());
      formDataToSend.append('position', formData.position);
      formDataToSend.append('backgroundColor', formData.backgroundColor);
      formDataToSend.append('textColor', formData.textColor);
      formDataToSend.append('buttonColor', formData.buttonColor);
      formDataToSend.append('isEnabled', 'true');
      formDataToSend.append('triggerType', 'scroll');
      formDataToSend.append('delaySeconds', '1');
      formDataToSend.append('frequency', 'every_visit');

      const response = await fetch(`/api/popup-settings`, {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ UPDATE Settings Success: ${JSON.stringify(data.settings, null, 2)}`);
      } else {
        setResult(`❌ UPDATE Settings Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ UPDATE Settings Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsLoading(false);
  };

  return (
    <Page title="Debug Settings Test">
      <BlockStack gap="500">
        <Banner tone="info" title="Debug Settings Test">
          <p>This page tests the popup settings API functionality directly.</p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Test Settings Form</Text>
            
            <FormLayout>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                autoComplete="off"
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                multiline={3}
                autoComplete="off"
              />

              <TextField
                label="Discount Percentage"
                type="number"
                value={formData.discountPercentage.toString()}
                onChange={(value) => setFormData({ ...formData, discountPercentage: parseInt(value) || 10 })}
                autoComplete="off"
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

              <FormLayout.Group>
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
              </FormLayout.Group>

              <InlineStack gap="300">
                <Button
                  onClick={testGetSettings}
                  loading={isLoading}
                >
                  Test Get Settings
                </Button>
                
                <Button
                  variant="primary"
                  onClick={testUpdateSettings}
                  loading={isLoading}
                >
                  Test Update Settings
                </Button>
              </InlineStack>
            </FormLayout>
          </BlockStack>
        </Card>

        {result && (
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">Test Result</Text>
              <div style={{ 
                background: result.includes('❌') ? '#ffebee' : '#e8f5e8',
                color: result.includes('❌') ? '#c62828' : '#2e7d32',
                padding: '12px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '12px'
              }}>
                {result}
              </div>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}