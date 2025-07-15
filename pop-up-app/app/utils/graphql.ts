// 🚀 OPTIMIZATION: Centralized GraphQL queries and mutations

export const PRODUCT_QUERIES = {
  CREATE_PRODUCT: `#graphql
    mutation populateProduct($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id
          title
          handle
          status
          createdAt
          updatedAt
          variants(first: 10) {
            edges {
              node {
                id
                price
                barcode
                createdAt
                inventoryQuantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,

  UPDATE_VARIANT: `#graphql
    mutation updateProductVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
          inventoryQuantity
        }
        userErrors {
          field
          message
        }
      }
    }
  `,

  GET_PRODUCTS: `#graphql
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            handle
            status
            createdAt
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  DELETE_PRODUCT: `#graphql
    mutation deleteProduct($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `,
};

// 🚀 DISCOUNT CODE QUERIES AND MUTATIONS
export const DISCOUNT_QUERIES = {
  CREATE_DISCOUNT_CODE: `#graphql
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                edges {
                  node {
                    code
                  }
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
                }
              }
              usageLimit
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,

  GET_DISCOUNT_CODES: `#graphql
    query getDiscountCodes($first: Int!, $after: String) {
      codeDiscountNodes(first: $first, after: $after) {
        edges {
          node {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                codes(first: 10) {
                  edges {
                    node {
                      code
                    }
                  }
                }
                startsAt
                endsAt
                usageLimit
                asyncUsageCount
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  DELETE_DISCOUNT_CODE: `#graphql
    mutation discountCodeDelete($id: ID!) {
      discountCodeDelete(id: $id) {
        deletedCodeDiscountId
        userErrors {
          field
          message
        }
      }
    }
  `,
};

// 🚀 DISCOUNT CODE HELPER FUNCTIONS
export const createDiscountCodeInput = (
  code: string,
  percentage: number,
  title: string = `Popup Discount ${code}`
) => ({
  title,
  code,
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  customerSelection: {
    all: true
  },
  customerGets: {
    value: {
      percentage: percentage / 100 // Convert to decimal (10% = 0.1)
    },
    items: {
      all: true
    }
  },
  usageLimit: 1, // Single use per customer
  appliesOncePerCustomer: true
});

export const generateUniqueDiscountCode = (): string => {
  const prefix = 'POPUP';
  // Use only alphanumeric characters for timestamp and random parts
  const timestamp = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Ensure we have enough characters, pad with numbers if needed
  const paddedRandom = (random + '0000').substr(0, 4);
  const code = `${prefix}-${timestamp}-${paddedRandom}`;
  
  // Final validation: ensure only alphanumeric, hyphens, and underscores
  return code.replace(/[^A-Z0-9\-_]/g, '');
};

// Validate discount code format for Shopify compatibility
export const validateDiscountCode = (code: string): boolean => {
  // Shopify discount codes must be:
  // - 3-255 characters long
  // - Only alphanumeric characters, hyphens, and underscores
  // - No spaces or special characters
  const validPattern = /^[A-Z0-9\-_]{3,255}$/;
  return validPattern.test(code);
};

// 🚀 OPTIMIZATION: Type-safe GraphQL response types
export interface DiscountCodeCreateResponse {
  discountCodeBasicCreate: {
    codeDiscountNode: {
      id: string;
      codeDiscount: {
        title: string;
        codes: {
          edges: Array<{
            node: {
              code: string;
            };
          }>;
        };
        startsAt: string;
        endsAt: string;
        customerSelection: {
          allCustomers: boolean;
        };
        customerGets: {
          value: {
            percentage: number;
          };
          items: any;
        };
        minimumRequirement: any;
        usageLimit: number;
      };
    };
    userErrors: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface ProductCreateResponse {
  productCreate: {
    product: {
      id: string;
      title: string;
      handle: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      variants: {
        edges: Array<{
          node: {
            id: string;
            price: string;
            barcode?: string;
            createdAt: string;
            inventoryQuantity?: number;
          };
        }>;
      };
    };
    userErrors: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface ProductVariantUpdateResponse {
  productVariantsBulkUpdate: {
    productVariants: Array<{
      id: string;
      price: string;
      barcode?: string;
      createdAt: string;
      inventoryQuantity?: number;
    }>;
    userErrors: Array<{
      field: string;
      message: string;
    }>;
  };
}

// 🚀 OPTIMIZATION: Helper functions for GraphQL operations
export const createProductInput = (title: string) => ({
  title,
  productType: "Sports Equipment",
  vendor: "Pop-up App Store",
  tags: ["generated", "demo", "sports", "pop-up-app"],
  status: "ACTIVE",
});

export const generateRandomPrice = (min: number = 50, max: number = 250): string => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

export const PRODUCT_NAMES = [
  "Red Snowboard", "Blue Skateboard", "Green Surfboard", "Yellow Wakeboard",
  "Purple Longboard", "Orange Snowboard", "Pink Skateboard", "Black Surfboard",
  "White Mountain Bike", "Silver Road Bike", "Gold BMX Bike", "Bronze Scooter"
];

export const getRandomProductName = (): string => {
  return PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)];
};