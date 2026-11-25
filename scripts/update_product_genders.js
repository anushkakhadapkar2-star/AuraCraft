const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDocs, collection } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MEN_PRODUCTS = [
  "prod-jw-mens-silver-kada",
  "prod-jw-mens-punjabi-kada",
  "prod-jw-mens-black-ring",
];

const WOMEN_PRODUCTS = [
  "prod-jw-pearl-earrings",
  "prod-jw-rose-studs",
  "prod-jw-enamel-bangles",
  "prod-jw-rosegold-kada",
  "prod-jw-floral-choker",
  "prod-jw-kundan-necklace",
  "prod-jw-rose-ring",
];

const NEW_MEN_ITEMS = [
  {
    id: "prod-jw-mens-cuban-chain",
    name: "Stainless Steel Beveled Cuban Chain (Men)",
    slug: "mens-steel-cuban-curb-chain",
    sku: "JW-MCHN-001",
    price: 499,
    discountPrice: 449,
    gender: "men",
    recipient: "men",
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    material: "316L Surgical Stainless Steel",
    dimensions: "Length 22 inches, Width 6mm",
    weight: "32g",
    inventory: { currentStock: 35, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/mens-silver-steel-kada.jpg", isPrimary: true, order: 0 }
    ],
    description: "Classic diamond-cut Cuban curb chain necklace for men in tarnish-free surgical stainless steel with a secure lobster clasp.",
  },
  {
    id: "prod-jw-mens-braided-kada",
    name: "Braided Genuine Leather & Steel Magnetic Kada (Men)",
    slug: "mens-braided-leather-steel-kada",
    sku: "JW-MKAD-003",
    price: 449,
    discountPrice: 399,
    gender: "men",
    recipient: "men",
    status: "ACTIVE",
    categoryId: "category-jewellery",
    categoryName: "Jewellery",
    categorySlug: "jewellery",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    material: "Braided Genuine Leather & Brushed Steel Clasp",
    dimensions: "Standard 8.2 inches (Fits M/L wrists)",
    weight: "22g",
    inventory: { currentStock: 40, lowStockThreshold: 5 },
    images: [
      { url: "/products/jewellery/mens-black-titanium-ring.jpg", isPrimary: true, order: 0 }
    ],
    description: "Double-wound premium black braided leather cuff paired with a brushed stainless magnetic locking clasp for men.",
  },
];

async function updateGenders() {
  console.log("Updating product genders in Firestore...");
  
  // 1. Update Men's Jewellery
  for (const id of MEN_PRODUCTS) {
    const ref = doc(db, "products", id);
    await setDoc(ref, {
      gender: "men",
      recipient: "men",
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Tagged as Men: ${id}`);
  }

  // 2. Add New Men's Jewellery items
  for (const item of NEW_MEN_ITEMS) {
    const ref = doc(db, "products", item.id);
    await setDoc(ref, {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Added Men's Item: ${item.name} (${item.id})`);
  }

  // 3. Update Women's Jewellery
  for (const id of WOMEN_PRODUCTS) {
    const ref = doc(db, "products", id);
    await setDoc(ref, {
      gender: "women",
      recipient: "women",
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Tagged as Women: ${id}`);
  }

  // 4. Update all other items in collection
  const snap = await getDocs(collection(db, "products"));
  for (const d of snap.docs) {
    const data = d.data();
    if (!data.gender) {
      let g = "unisex";
      const cat = data.categorySlug || "";
      const text = `${data.name || ""} ${data.description || ""}`.toLowerCase();
      if (cat.includes("bouquet") || cat.includes("flower") || cat.includes("toran")) {
        g = "women";
      } else if (cat.includes("chocolate") || cat.includes("hamper") || cat.includes("home-decor")) {
        g = "unisex";
      }
      if (text.includes("(men)") || text.includes("men's") || text.includes("kada")) {
        g = "men";
      }
      await setDoc(doc(db, "products", d.id), {
        gender: g,
        recipient: g,
      }, { merge: true });
    }
  }

  console.log("All product genders updated successfully!");
  process.exit(0);
}

updateGenders().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
