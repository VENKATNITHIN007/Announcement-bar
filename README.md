# Shopify Announcement Bar App (MERN Stack)

This is a custom full-stack Shopify App . It allows merchants to manage a floating storefront announcement bar from their Shopify Admin Panel, while maintaining a complete audit history log in MongoDB.

## 🚀 Features

1.  **Merchant Settings Dashboard (React & Polaris):** A native-feeling Shopify Admin form containing a text input field and a "Save Announcement" button.
2.  **Audit Log Database (MongoDB Atlas & Mongoose):** Every time the announcement text is saved, a document containing the text and the exact timestamp is appended to a MongoDB database to maintain a history log.
3.  **Active Value Sync (Shopify REST Admin API):** The backend uses Shopify's REST Admin API to sync the active announcement text to a Shop-level Metafield (`my_app.announcement`).
4.  **High-Performance Storefront Banner (Theme App Extension):** A Liquid-based App Embed Block that reads the metafield value directly from Shopify's servers, rendering a beautiful purple floating banner instantly on all store pages without requiring client-side JS or API calls.
5.  **Secure Authentication (JWT & SQLite):** Uses Shopify App Bridge to intercept browser requests and append JWT session tokens, which are validated against store access tokens persisted in a local SQLite database (`database.sqlite`).

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** React (Vite, React Router v6, React Query, i18next).
*   **Design System:** Shopify Polaris (React Components).
*   **Backend:** Node.js, Express.js.
*   **Databases:**
    *   **MongoDB Atlas:** Stores the audit logs of all saved announcements.
    *   **SQLite:** Stores the shop access tokens used by the Shopify SDK.
*   **Storefront Integration:** Shopify Liquid (Theme App Extension / App Embed Block).

---

## ⚙️ How to Run Locally

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   Shopify Partner Account & a Development Store
*   MongoDB Atlas Connection String

### 2. Installation
Clone the repository and install all dependencies in the root directory:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file inside the `web/` directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 4. Start Development Server
Run the startup command in your terminal:
```bash
npm run dev
```
*   Select your Partner Organization and Development Store if prompted.
*   The Shopify CLI will automatically spin up a Cloudflare secure tunnel and start the Express backend and React frontend.
*   Input your Storefront Password (found in **Online Store -> Preferences** in Shopify Admin) if requested by the CLI.

### 5. Enable the App Embed Block
*   Go to your Development Store's Theme Customizer.
*   Click on the **App Embeds** tab in the left sidebar.
*   Toggle the **Announcement Bar** to **ON** and click **Save** in the top right.
