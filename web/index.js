// @ts-check
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import Announcement from "./Announcement.model.js";
import "./db.js"


const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const __dirname = dirname(fileURLToPath(import.meta.url));

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? join(__dirname, "frontend", "dist")
    : join(__dirname, "frontend");

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);

//   res.status(200).send({ count: countData.data.productsCount.count });
// });

// app.post("/api/products", async (_req, res) => {
//   let status = 200;
//   let error = null;

//   try {
//     await productCreator(res.locals.shopify.session);
//   } catch (e) {
//     console.log(`Failed to process products/create: ${e.message}`);
//     status = 500;
//     error = e.message;
//   }
//   res.status(status).send({ success: status === 200, error });
// });


app.post("/api/announcement", async (req, res) => {
  const { text } = req.body;

  if (!text && text !== "") {
    return res.status(400).json({ error: "Announcement text is required" });
  }

  try {
    // 1. Save to MongoDB (Audit History Log)
    const logEntry = new Announcement({ text });
    await logEntry.save();
    console.log(`[MongoDB] Logged new announcement: "${text}"`);

    // 2. Sync to Shopify (Write Shop Metafield)
    // Create a REST client using the merchant's active session
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    // Make the POST request to Shopify's metafields endpoint
    await client.post({
      path: "metafields",
      data: {
        metafield: {
          namespace: "my_app",
          key: "announcement",
          value: text,
          type: "single_line_text_field",
        },
      },
      
    });
    console.log(`[Shopify API] Successfully synced metafield to shop`);

    // Return success to the frontend
    res.status(200).json({ success: true, text });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Error] Failed to save announcement:`, errorMessage);
    res.status(500).json({ error: "Failed to save announcement", details: errorMessage });
  }
});

app.get("/api/announcement", async (req, res) => {
  try {
    // Create a REST client using the merchant's active session
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    // Query Shopify to list our metafields
    const response = await client.get({
      path: "metafields",
      query: {
        namespace: "my_app",
        key: "announcement",
      },
    });

    const metafields = response.body.metafields || [];
    // If the metafield exists, return its value; otherwise return an empty string
    const currentText = metafields.length > 0 ? metafields[0].value : "";

    res.status(200).json({ text: currentText });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Error] Failed to get announcement:`, errorMessage);
    res.status(500).json({ error: "Failed to get announcement" });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
