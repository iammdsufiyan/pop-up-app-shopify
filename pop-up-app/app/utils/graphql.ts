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

// 🚀 OPTIMIZATION: Type-safe GraphQL response types
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