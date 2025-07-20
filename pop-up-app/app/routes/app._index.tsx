import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  DataTable,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import PopupSettingsModal from "../components/PopupSettingsModal";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Get subscription statistics
    const totalSubscribers = await prisma.popupSubscriber.count({
      where: { isActive: true }
    });

    const todaySubscribers = await prisma.popupSubscriber.count({
      where: {
        isActive: true,
        subscribedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const recentSubscribers = await prisma.popupSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        discountCode: true,
        subscribedAt: true,
        blockId: true,
      }
    });

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
        } as any
      });
    }

    return {
      stats: {
        total: totalSubscribers,
        today: todaySubscribers,
        recent: recentSubscribers,
      },
      settings
    };
  } catch (error) {
    console.error("Stats error:", error);
    return {
      stats: {
        total: 0,
        today: 0,
        recent: [],
      },
      settings: null
    };
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const { stats, settings } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  // Format recent subscribers for DataTable
  const subscriberRows = stats.recent.map((subscriber) => [
    subscriber?.email || "",
    subscriber?.phone || "—",
    subscriber?.discountCode || "",
    subscriber?.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : "",
    subscriber?.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleTimeString() : "",
  ]);

  return (
    <Page>
      <TitleBar title="Pop-up Discount App">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    🎉 Pop-up Discount App Dashboard
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Your pop-up discount feature is ready! This app includes a complete
                    pop-up system with email collection, discount code generation, and
                    admin management. Visit{" "}
                    <Link url="/app/popup-settings" removeUnderline>
                      Pop-up Settings
                    </Link>{" "}
                    to configure your pop-up appearance, timing, and discount settings.
                    <br /><br />
                    You can also visit{" "}
                    <Link url="/app/option-sets" removeUnderline>
                      Option Sets
                    </Link>{" "}
                    to see the new full-screen modal system similar to Shopify's interface.
                  </Text>
                </BlockStack>
                
                {/* Analytics Section */}
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    📊 Pop-up Analytics & Email Storage
                  </Text>
                  <InlineStack gap="400">
                    <Card>
                      <BlockStack gap="200">
                        <Text as="h4" variant="headingSm">Total Subscribers</Text>
                        <Text as="p" variant="headingLg">{stats.total}</Text>
                        <Badge tone="success">
                          {stats.total > 0 ? "✅ Storing emails" : "⏳ No subscribers yet"}
                        </Badge>
                      </BlockStack>
                    </Card>
                    <Card>
                      <BlockStack gap="200">
                        <Text as="h4" variant="headingSm">Today's Subscribers</Text>
                        <Text as="p" variant="headingLg">{stats.today}</Text>
                        <Badge tone="info">New today</Badge>
                      </BlockStack>
                    </Card>
                  </InlineStack>
                  
                  {stats.recent.length > 0 && (
                    <Card>
                      <BlockStack gap="300">
                        <Text as="h4" variant="headingSm">Recent Subscribers</Text>
                        <DataTable
                          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                          headings={['Email', 'Phone', 'Discount Code', 'Date', 'Time']}
                          rows={subscriberRows}
                        />
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                      removeUnderline
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                  >
                    Create Pop-up Setting
                  </Button>
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
      
      {/* Popup Settings Modal */}
      <PopupSettingsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
      />
    </Page>
  );
}
