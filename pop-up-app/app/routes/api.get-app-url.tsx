import { json } from "@remix-run/node";
import { getAppUrl } from "../shopify.server";

// 🚀 API endpoint to provide the dynamic app URL to the frontend
export const loader = async () => {
  const appUrl = getAppUrl();
  console.log("🚀 Providing app URL to frontend:", appUrl);
  return json(
    { appUrl },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    }
  );
};