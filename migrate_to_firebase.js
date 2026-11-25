const { PrismaClient } = require('@prisma/client');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const prisma = new PrismaClient();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
this
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log("Starting migration to Firestore using Client SDK...");

  // 1. Migrate Categories
  console.log("Migrating Categories...");
  const categories = await prisma.category.findMany();
  const categoryMap = {}; // Maps sqlite ID to firestore Doc Ref or Data

  for (const cat of categories) {
    const docRef = doc(db, 'categories', cat.id);
    await setDoc(docRef, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      image: cat.image || null,
      status: cat.status,
      displayOrder: cat.displayOrder,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString()
    });
    categoryMap[cat.id] = { name: cat.name, slug: cat.slug };
  }
  console.log(`Migrated ${categories.length} categories.`);

  // 2. Migrate Products (including images and inventory)
  console.log("Migrating Products...");
  const products = await prisma.product.findMany({
    include: {
      images: true,
      inventory: true
    }
  });

  for (const prod of products) {
    const docRef = doc(db, 'products', prod.id);
    await setDoc(docRef, {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      description: prod.description,
      shortDescription: prod.shortDescription || null,
      price: prod.price,
      discountPrice: prod.discountPrice || null,
      status: prod.status,
      categoryId: prod.categoryId,
      categoryName: categoryMap[prod.categoryId]?.name || null,
      categorySlug: categoryMap[prod.categoryId]?.slug || null,
      isFeatured: prod.isFeatured,
      isBestSeller: prod.isBestSeller,
      isNewArrival: prod.isNewArrival,
      images: prod.images.map(img => ({
        url: img.url,
        isPrimary: img.isPrimary,
        order: img.order
      })),
      inventory: {
        currentStock: prod.inventory?.currentStock || 0,
        lowStockThreshold: prod.inventory?.lowStockThreshold || 5
      },
      createdAt: prod.createdAt.toISOString(),
      updatedAt: prod.updatedAt.toISOString()
    });
  }
  console.log(`Migrated ${products.length} products.`);

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch(console.error);
