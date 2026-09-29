# Aura Craft — E-Commerce Platform

Aura Craft is a premium, fully responsive, full-stack e-commerce web application for selling handmade crafts, flowers, home décor, and gifting products. The visual identity draws inspiration from modern, premium marketplaces to deliver a dynamic, high-quality user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: Vanilla CSS (`globals.css`) + Tailwind CSS (for layout utilities)
- **Database**: [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Phone Number OTP) + JWT Cookies (`jose` library)
- **State Management**: Zustand (Client-side, e.g., Cart state)
- **Icons**: Google Material Symbols & Lucide React
- **Hosting / Deployment**: Ready for Vercel

## 🛠️ Summary of Completed Work

### 1. Architectural Overhaul (SQLite to Firebase)
- **Database Migration**: Fully migrated the platform away from a local SQLite database (`dev.db`) and Prisma ORM to **Firebase Cloud Firestore**.
- **Data Transfer**: Executed a custom Node.js script (`migrate_to_firebase.js`) to transfer all mock categories and products from the old SQLite database into the live Firestore instance.
- **Client SDK Integration**: Since Firebase Admin privileges were intentionally restricted, the entire application was re-architected to securely use the **Firebase Client SDK**. Server Components (`page.tsx`) now execute queries using the public Client SDK instead of `firebase-admin`.

### 2. Authentication & Session Management
- **NextAuth Removal**: Completely removed the NextAuth dependency as requested, pivoting to native Firebase Authentication.
- **JWT Decoding**: Implemented a custom session handling system. The frontend retrieves a Firebase ID token upon OTP verification, sends it to the Next.js backend, and sets it as an `httpOnly` cookie. The server decodes this JWT using the `jose` library to extract the user's `uid` for secure server-side data fetching (Orders, Wishlists, Account details).

### 3. Application Features Built & Wired
- **Dynamic Shop & Filtering**: The Shop page pulls products directly from Firestore. Due to Firestore's index limitations, advanced sorting (Price High/Low, Newest) and filtering (Search queries) are executed elegantly in JavaScript after fetching the active documents, avoiding the need for complex composite indexes in the Firebase Console.
- **Transactional Checkout**: Implemented an atomic checkout route (`/api/checkout`) using Firestore Transactions to ensure stock inventory is safely deducted before finalizing an order.
- **Wishlist & Cart**: Wishlist interactions use Firestore array operations (`arrayUnion`/`arrayRemove`) to toggle items in real-time.
- **Admin Dashboard**: The Admin Dashboard (`/admin`) tracks total users, orders, and products by executing real-time `getCountFromServer` queries against the live database.

### 4. UI/UX Polish
- **Component Fixes**: Repaired missing UI components (e.g., `ProductCard`) to ensure Next.js Server Components compile correctly.
- **Error Boundaries**: Wrapped server-side data fetching in `try/catch` blocks. If Firestore permissions are denied, the UI gracefully renders a fallback error state rather than crashing the Next.js process.
- **Next.js 15 Compliance**: Updated `searchParams` parsing across all dynamic routes to `await` the Promise, fully complying with Next.js 15 routing standards.

## 💻 How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env.local` file contains your Firebase Client configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="..."
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*
