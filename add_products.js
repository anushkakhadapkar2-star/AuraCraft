const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, addDoc } = require('firebase/firestore');
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

const newProducts = [
  {
    name: "Hand-painted Ceramic Mug",
    slug: "hand-painted-ceramic-mug",
    sku: "MUG-001",
    description: "Enjoy your morning coffee with this beautifully hand-painted ceramic mug. Made with food-safe glazes.",
    price: 499,
    discountPrice: 399,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    material: "Ceramic",
    dimensions: "3.5 x 4 inches",
    weight: "350g",
    images: [
      {
        url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop",
        isPrimary: true,
        order: 1
      },
      {
        url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop",
        isPrimary: false,
        order: 2
      }
    ],
    inventory: {
      currentStock: 25,
      lowStockThreshold: 5
    }
  },
  {
    name: "Boho Macrame Wall Hanging",
    slug: "boho-macrame-wall-hanging",
    sku: "MAC-001",
    description: "Add a touch of bohemian elegance to any room with this intricate macrame wall hanging, crafted from 100% natural cotton.",
    price: 1299,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    material: "Cotton Cord",
    dimensions: "15 x 30 inches",
    weight: "500g",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
        isPrimary: true,
        order: 1
      }
    ],
    inventory: {
      currentStock: 10,
      lowStockThreshold: 2
    }
  },
  {
    name: "Ocean Resin Art Coasters (Set of 4)",
    slug: "ocean-resin-art-coasters",
    sku: "RES-001",
    description: "Protect your surfaces in style with these stunning ocean-inspired resin coasters. Set of 4.",
    price: 899,
    discountPrice: 799,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    material: "Epoxy Resin",
    dimensions: "4 x 4 inches (each)",
    weight: "200g",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555622080-6927d6d5ef66?q=80&w=600&auto=format&fit=crop",
        isPrimary: true,
        order: 1
      }
    ],
    inventory: {
      currentStock: 15,
      lowStockThreshold: 3
    }
  },
  {
    name: "Lavender Essential Oil Soap",
    slug: "lavender-essential-oil-soap",
    sku: "SOAP-001",
    description: "Relax and unwind with this all-natural lavender soap, made with pure essential oils and shea butter.",
    price: 249,
    discountPrice: null,
    status: "ACTIVE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    material: "Organic Soap Base, Lavender",
    dimensions: "3 x 2 x 1 inches",
    weight: "100g",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=600&auto=format&fit=crop",
        isPrimary: true,
        order: 1
      }
    ],
    inventory: {
      currentStock: 50,
      lowStockThreshold: 10
    }
  },
  {
    name: "Handwoven Jute Rug",
    slug: "handwoven-jute-rug",
    sku: "RUG-001",
    description: "Bring a rustic, earthy feel to your home with this durable handwoven jute rug.",
    price: 2499,
    discountPrice: 2199,
    status: "ACTIVE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    material: "100% Natural Jute",
    dimensions: "3 x 5 feet",
    weight: "2.5kg",
    images: [
      {
        url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=600&auto=format&fit=crop",
        isPrimary: true,
        order: 1
      }
    ],
    inventory: {
      currentStock: 5,
      lowStockThreshold: 1
    }
  }
];

async function addProducts() {
  console.log("Fetching categories...");
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Try to find a general category, or fallback to the first one
  let category = categories.find(c => c.slug === 'home-decor') || categories[0];
  
  if (!category) {
    console.log("No categories found. Adding a default category first...");
    const newCatRef = await addDoc(collection(db, 'categories'), {
      name: "Home Decor",
      slug: "home-decor",
      status: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    category = { id: newCatRef.id, name: "Home Decor", slug: "home-decor" };
  }

  console.log(`Using category: ${category.name}`);

  for (const prod of newProducts) {
    console.log(`Adding ${prod.name}...`);
    // Create a new doc reference with auto-generated ID
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, {
      ...prod,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log("Successfully added products!");
  process.exit(0);
}

addProducts().catch(console.error);
