# Aura Craft — Artisan E-Commerce Web Application

**Aura Craft** is a full-stack, responsive e-commerce web application designed for handcrafted crochet creations, everlasting floral arrangements, home décor, and personalized gifting. 

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Firebase Cloud Firestore & Authentication**, the platform provides a complete customer shopping experience modeled after top-tier e-commerce applications (Amazon, Myntra, Flipkart) combined with an artisanal boutique aesthetic.

---

## 🌟 Key Application Features

### 🛍️ Customer Storefront (`http://localhost:3000`)
- **Artisan Showcase Homepage**: Hero banner, Category Quick-Pills, Best Sellers carousel, Brand Guarantees (100% Handcrafted, Eco-friendly Yarn, Fragile-Safe Packing), Fresh Arrivals, Customer Photo Reviews, and Custom Order CTA.
- **Dynamic Categories Catalog (`/categories`)**: Visual taxonomy cards with live product counts and custom request banner.
- **Smart Product Search & Filtering (`/shop`)**: Instant query filtering (`?q=`), category selection, price range filters, and sorting (Newest, Price Low $\leftrightarrow$ High).
- **Interactive Product Details (`/product/[slug]`)**:
  - Multi-image gallery with thumbnail switcher.
  - Live inventory & low-stock indicators.
  - "Recently Viewed Products" drawer.
  - WhatsApp custom order inquiry integration with prefilled details.
  - Customer review submissions with star ratings and photo uploads.
- **Cart & Wishlist**:
  - Persistent slide-out cart drawer with quantity adjustments, free shipping progress bar, and real-time subtotal.
  - Quick-save wishlist toggles across product cards and shop grids.
- **Checkout & Address Management (`/checkout`)**:
  - Saved address selector (Home / Office) with 1-click selection and inline address creation.
  - Live coupon code redemption (`WELCOME10`, `AURA50`, `FESTIVE20`) with instant subtotal deduction.
  - Transactional inventory check ensuring stock availability before order placement.
- **Order Tracking (`/track-order/[id]`)**:
  - Deterministic tracking IDs (`AC-TRK-...`) with a milestone progress stepper (`Order Placed` → `Confirmed` → `Crafted` → `Shipped` → `Delivered`).
- **Customer Profile & Account (`/profile`)**:
  - Personalized profile dashboard with dynamic initials avatar (e.g. *Anushka Khadapkar* → **AK**).
  - Saved delivery destinations, order history, wishlist manager, and active coupon wallet.

---

### 🔐 Dedicated Admin Dashboard (`http://localhost:3001` or `/admin`)
- **Real-Time Analytics**: Live Firestore revenue metrics, total orders, customer count, and low-stock product alerts.
- **Catalog & Inventory Management**: Add, update, and delete products with image upload, SKU tracking, pricing, and stock controls.
- **Category Management**: Create and organize dynamic product categories.
- **Order Pipeline**: Review customer orders, inspect delivery addresses, and update fulfillment milestones.
- **Customer Reviews & Moderation**: Approve or archive customer reviews and photo submissions.
- **Coupons & Promotional Banners**: Create promotional codes and update seasonal banner copy.
- **Role Isolation**: Admin routes are protected from customer sessions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with Custom Theme Colors & Typography |
| **Database** | [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Phone OTP & Email) + Signed HTTP-Only Session Cookies (`jose`) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (Persistent Local & Cart State) |
| **Charts & Analytics** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.18+ or v20+)
- **npm** or **pnpm**

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Optional session secret
SESSION_SECRET="your-secure-jwt-secret-key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Web Application
Aura Craft supports running both the Storefront and the Dedicated Admin Panel concurrently:

```bash
# Start both Storefront (Port 3000) and Dedicated Admin Server (Port 3001):
npm run dev
```

- **Customer Storefront**: [`http://localhost:3000`](http://localhost:3000)
- **Admin Panel**: [`http://localhost:3001`](http://localhost:3001) or [`http://localhost:3000/admin`](http://localhost:3000/admin)

Or run individual services:
```bash
npm run dev:website   # Storefront only on port 3000
npm run dev:admin     # Admin proxy on port 3001
```

---

## 🧪 Build & Quality Verification

```bash
# Run TypeScript type check across the entire project (0 errors)
npx tsc --noEmit

# Compile production build
npm run build

# Start production server
npm run start
```
