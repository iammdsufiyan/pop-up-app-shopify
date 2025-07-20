import { useState, useEffect } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import {
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Divider,
  Box,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import SlideUpModal from "../components/SlideUpModal";

interface Option {
  id: string;
  type: "text" | "color";
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  colors?: string[];
}

interface OptionSet {
  id: string;
  name: string;
  status: "Draft" | "Published";
  options: Option[];
}

// Mock option set data
const mockOptionSetData: Record<string, OptionSet> = {
  "100993": {
    id: "100993",
    name: "New option set",
    status: "Published",
    options: [
      {
        id: "1",
        type: "text",
        label: "Single-line text 1",
        placeholder: "Enter text...",
        required: false,
        maxLength: 100,
      },
      {
        id: "2",
        type: "text",
        label: "Single-line text 2",
        placeholder: "Enter text...",
        required: false,
        maxLength: 100,
      },
      {
        id: "3",
        type: "text",
        label: "Single-line text 3",
        placeholder: "Enter text...",
        required: false,
        maxLength: 100,
      },
      {
        id: "4",
        type: "color",
        label: "Color swatch 1",
        colors: ["#8B0000", "#B22222", "#90EE90"],
      },
    ],
  },
  new: {
    id: "new",
    name: "New Option Set",
    status: "Draft",
    options: [],
  },
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response("Option set ID is required", { status: 400 });
  }

  // In a real app, you would fetch the option set from your database
  const optionSet = mockOptionSetData[id];
  
  if (!optionSet) {
    throw new Response("Option set not found", { status: 404 });
  }

  return {
    optionSet,
    shop: session.shop,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const { id } = params;

  const action = formData.get("action");

  if (action === "save") {
    // In a real app, you would save the option set to your database
    console.log("Saving option set:", id);
    return { success: true, message: "Option set saved successfully!" };
  }

  if (action === "publish") {
    // In a real app, you would publish the option set
    console.log("Publishing option set:", id);
    return { success: true, message: "Option set published successfully!" };
  }

  return { success: false, message: "Unknown action" };
};

export default function OptionSetEdit() {
  const { optionSet } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  
  const [formData, setFormData] = useState({
    name: optionSet.name,
    status: optionSet.status,
  });
  
  const [options, setOptions] = useState<Option[]>(optionSet.options);
  const [showBanner, setShowBanner] = useState(false);

  const isLoading = fetcher.state === "submitting";
  const isNew = optionSet.id === "new";

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }
  }, [fetcher.data]);

  const handleClose = () => {
    navigate("/app/option-sets");
  };

  const handleSave = () => {
    fetcher.submit(
      { action: "save", ...formData },
      { method: "POST" }
    );
  };

  const handlePublish = () => {
    fetcher.submit(
      { action: "publish", ...formData },
      { method: "POST" }
    );
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      type: "text",
      label: `Single-line text ${options.length + 1}`,
      placeholder: "Enter text...",
      required: false,
      maxLength: 100,
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter(option => option.id !== optionId));
  };

  const handleOptionChange = (optionId: string, field: keyof Option, value: any) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, [field]: value }
        : option
    ));
  };

  return (
    <SlideUpModal
      open={true}
      onClose={handleClose}
      title={isNew ? "Create option set" : formData.name}
      subtitle={isNew ? undefined : "Configure your product options"}
      breadcrumbs={[
        { content: "Option sets", url: "/app/option-sets" },
        { content: isNew ? "New" : formData.name },
      ]}
      primaryAction={{
        content: isNew ? "Create" : "Save",
        onAction: handleSave,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Apply to 1 product(s)",
          onAction: () => console.log("Apply to products"),
        },
        {
          content: "More",
          onAction: () => console.log("More actions"),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          {showBanner && fetcher.data?.success && (
            <Banner tone="success" onDismiss={() => setShowBanner(false)}>
              {fetcher.data.message}
            </Banner>
          )}

          {!isNew && (
            <Banner tone="info">
              <Text as="p" variant="bodyMd">
                Your option set has been published! Please make sure to check the options on your live store to verify that everything is set up correctly.
              </Text>
              <InlineStack gap="200">
                <Button variant="plain" size="micro">
                  Why my option set is not visible?
                </Button>
                <Button variant="plain" size="micro">
                  Contact support
                </Button>
              </InlineStack>
            </Banner>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Option Configuration
              </Text>
              
              <FormLayout>
                <TextField
                  label="Option set name"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  autoComplete="off"
                />

                <Select
                  label="Status"
                  options={[
                    { label: "Draft", value: "Draft" },
                    { label: "Published", value: "Published" },
                  ]}
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value as "Draft" | "Published" })}
                />
              </FormLayout>

              <Divider />

              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Options
                  </Text>
                  <Button onClick={handleAddOption}>
                    Add new option
                  </Button>
                </InlineStack>

                {options.map((option) => (
                  <Card key={option.id}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <InlineStack gap="200" align="center">
                          <Text as="h4" variant="headingSm">
                            {option.type === "text" ? "A" : "●"} {option.label}
                          </Text>
                          <Badge tone={option.type === "color" ? "info" : "attention"}>
                            {option.type === "text" ? "Text" : "Color"}
                          </Badge>
                        </InlineStack>
                        <InlineStack gap="200">
                          <Button
                            variant="plain"
                            size="micro"
                            onClick={() => console.log("Edit option", option.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="plain"
                            size="micro"
                            tone="critical"
                            onClick={() => handleRemoveOption(option.id)}
                          >
                            Remove
                          </Button>
                        </InlineStack>
                      </InlineStack>

                      <FormLayout>
                        <TextField
                          label="Label"
                          value={option.label}
                          onChange={(value) => handleOptionChange(option.id, "label", value)}
                          autoComplete="off"
                        />
                        
                        {option.type === "text" && (
                          <>
                            <TextField
                              label="Placeholder"
                              value={option.placeholder || ""}
                              onChange={(value) => handleOptionChange(option.id, "placeholder", value)}
                              autoComplete="off"
                            />
                            <TextField
                              label="Character limit"
                              type="number"
                              value={option.maxLength?.toString() || "100"}
                              onChange={(value) => handleOptionChange(option.id, "maxLength", parseInt(value) || 100)}
                              autoComplete="off"
                            />
                          </>
                        )}

                        {option.type === "color" && (
                          <Box>
                            <Text as="p" variant="bodyMd">
                              Color options
                            </Text>
                            <InlineStack gap="200">
                              {option.colors?.map((color: string, colorIndex: number) => (
                                <div
                                  key={colorIndex}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: color,
                                    borderRadius: "4px",
                                    border: "1px solid var(--p-color-border)",
                                  }}
                                />
                              ))}
                            </InlineStack>
                          </Box>
                        )}
                      </FormLayout>
                    </BlockStack>
                  </Card>
                ))}

                {options.length === 0 && (
                  <Card>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        No options added yet. Click "Add new option" to get started.
                      </Text>
                    </BlockStack>
                  </Card>
                )}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Preview
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                This is how your options will appear to customers:
              </Text>
              
              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
                borderWidth="025"
                borderColor="border"
              >
                <BlockStack gap="300">
                  {options.map((option) => (
                    <div key={option.id}>
                      <Text as="p" variant="bodyMd">
                        {option.label}
                      </Text>
                      {option.type === "text" && (
                        <TextField
                          label=""
                          value=""
                          placeholder={option.placeholder}
                          autoComplete="off"
                          disabled
                        />
                      )}
                      {option.type === "color" && (
                        <InlineStack gap="200">
                          {option.colors?.map((color: string, colorIndex: number) => (
                            <div
                              key={colorIndex}
                              style={{
                                width: "24px",
                                height: "24px",
                                backgroundColor: color,
                                borderRadius: "50%",
                                border: "2px solid var(--p-color-border)",
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </InlineStack>
                      )}
                    </div>
                  ))}
                  
                  {options.length === 0 && (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Add options to see preview
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h4" variant="headingSm">
                Character limits
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                0/100
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Limit 100 characters
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SlideUpModal>
  );
}