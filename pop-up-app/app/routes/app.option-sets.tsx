import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  DataTable,
  InlineStack,
  Text,
  Badge,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Mock data for option sets (similar to what's shown in your images)
const mockOptionSets = [
  {
    id: "100993",
    name: "New option set",
    status: "Published",
    appliedOn: "1 product(s)",
    totalOrders: "...",
    totalAddOnValues: "...",
    isActive: true,
  },
  {
    id: "100994",
    name: "Color Options",
    status: "Draft",
    appliedOn: "3 product(s)",
    totalOrders: "25",
    totalAddOnValues: "$150.00",
    isActive: false,
  },
  {
    id: "100995",
    name: "Size Variants",
    status: "Published",
    appliedOn: "5 product(s)",
    totalOrders: "42",
    totalAddOnValues: "$320.00",
    isActive: true,
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // In a real app, you would fetch option sets from your database
  // For now, we'll return mock data
  return {
    optionSets: mockOptionSets,
    shop: session.shop,
  };
};

export default function OptionSets() {
  const { optionSets } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleOptionSetClick = (optionSetId: string) => {
    navigate(`/app/option-sets/${optionSetId}`);
  };

  const handleCreateOptionSet = () => {
    navigate("/app/option-sets/new");
  };

  const handleToggleStatus = (optionSetId: string) => {
    // In a real app, you would update the status in your database
    console.log("Toggle status for option set:", optionSetId);
  };

  const handleBulkAction = (action: string) => {
    console.log("Bulk action:", action, "for items:", selectedItems);
  };

  // Format data for DataTable
  const rows = optionSets.map((optionSet) => [
    optionSet.name,
    <Badge tone={optionSet.status === "Published" ? "success" : "attention"}>
      {optionSet.status}
    </Badge>,
    optionSet.appliedOn,
    optionSet.totalOrders,
    optionSet.totalAddOnValues,
    <InlineStack gap="200">
      <Button
        variant="plain"
        size="micro"
        onClick={() => handleToggleStatus(optionSet.id)}
      >
        {optionSet.isActive ? "Disable" : "Enable"}
      </Button>
      <Button
        variant="plain"
        size="micro"
        onClick={() => handleOptionSetClick(optionSet.id)}
      >
        Edit
      </Button>
      <Button
        variant="plain"
        size="micro"
        tone="critical"
        onClick={() => console.log("Delete", optionSet.id)}
      >
        Delete
      </Button>
    </InlineStack>,
  ]);

  const promotedBulkActions = [
    {
      content: "Enable selected",
      onAction: () => handleBulkAction("enable"),
    },
    {
      content: "Disable selected",
      onAction: () => handleBulkAction("disable"),
    },
  ];

  const bulkActions = [
    {
      content: "Delete selected",
      onAction: () => handleBulkAction("delete"),
    },
  ];

  return (
    <Page>
      <TitleBar title="Option sets">
        <button variant="primary" onClick={handleCreateOptionSet}>
          Create option set
        </button>
      </TitleBar>
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Option set list
                </Text>
                <InlineStack gap="200">
                  <Button onClick={() => console.log("Saved options")}>
                    Saved options
                  </Button>
                  <Button onClick={() => console.log("More actions")}>
                    More actions
                  </Button>
                  <Button variant="primary" onClick={handleCreateOptionSet}>
                    Create option set
                  </Button>
                </InlineStack>
              </InlineStack>

              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                headings={[
                  'Option set',
                  'Status',
                  'Applied on',
                  'Total orders by app',
                  'Total add-on values',
                  'Actions',
                ]}
                rows={rows}
                sortable={[true, true, true, true, true, false]}
                defaultSortDirection="ascending"
                initialSortColumnIndex={0}
                onSort={(headingIndex: number, direction: 'ascending' | 'descending') => {
                  console.log("Sort by column", headingIndex, "in", direction, "order");
                }}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Customize the style of your options
              </Text>
              <Text as="p" variant="bodyMd">
                Need to change the look or position of the options? Please send us your requirement.
                Our support team is here to make the options match with your theme style.
              </Text>
              <InlineStack gap="200">
                <Button>Chat with us</Button>
                <Button variant="plain">or follow our instruction</Button>
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Feature requests
              </Text>
              <Text as="p" variant="bodyMd">
                Anything you're missing in our app? Let us know! We love hearing your ideas. 
                Your suggestions help us decide what to add next to make the app even better.
              </Text>
              <Button>Request a feature</Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}