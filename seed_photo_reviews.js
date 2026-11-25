const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');
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

const SAMPLE_PHOTO_REVIEWS = [
  {
    productSlug: 'crotchet-bouquet',
    productName: 'Crotchet Bouquet',
    userName: 'Aanya Sharma',
    rating: 5,
    title: 'Exceeded my expectations! Looks like a fairytale in my room.',
    comment: 'I ordered this crochet bouquet for my study table and oh my god, the details on each flower petal are mind-blowing! You can tell so much love and patience went into making this. It arrived in sturdy eco-friendly packaging without a single bent stem. Best part? These flowers will never wilt! 🌸✨',
    images: ['/products/crochet_mixed_bouquet_vase.png', '/products/crochet_pink_lily.png'],
    verifiedPurchase: true,
    helpfulCount: 24,
    daysAgo: 3,
  },
  {
    productSlug: 'enchanted-crochet-rose-lamp',
    productName: 'Enchanted Crochet Rose Lamp',
    userName: 'Rohan Mehra',
    rating: 5,
    title: 'Perfect anniversary gift for my girlfriend! She cried tears of joy.',
    comment: 'The soft glow of this enchanted rose lamp creates the coziest ambient lighting at night. It looks like the rose from Beauty and the Beast. The crochet work around the stem and petals is immaculate. Highly recommended for gifting!',
    images: ['/products/crochet_rose_lamp.jpg'],
    verifiedPurchase: true,
    helpfulCount: 19,
    daysAgo: 6,
  },
  {
    productSlug: 'crotchet wall hanging toran',
    productName: 'Crotchet Wall Hanging Toran',
    userName: 'Deepika Iyer',
    rating: 5,
    title: 'Traditional yet modern aesthetic for our Diwali doorway!',
    comment: 'Everyone who visited our house during the festival asked where we got this toran from! The colors are vibrant and rich, and the pearls add such a classy, festive finish. Definitely buying another one for my mother in law.',
    images: ['/uploads/1788501782346-242804304-crotchetflowerswallhangingtoran.jpg'],
    verifiedPurchase: true,
    helpfulCount: 31,
    daysAgo: 8,
  },
  {
    productSlug: 'pipe-cleaner-mirror',
    productName: 'Pipe Cleaner Sunflower Mirror',
    userName: 'Tanya Verma',
    rating: 5,
    title: 'The cutest aesthetic mirror selfie spot ever 🌻',
    comment: 'Saw this on Instagram and ordered immediately. The sunflower petals made with pipe cleaners are fluffy, vibrant, and firmly glued. It came very safely bubble wrapped so the glass mirror was completely intact. Adds so much cheer to my dressing table!',
    images: ['/uploads/1788500269492-761373727-pipecleanersunflowermirror.jpg'],
    verifiedPurchase: true,
    helpfulCount: 15,
    daysAgo: 10,
  },
  {
    productSlug: 'sunshine-sunflower-bouquet',
    productName: 'Sunshine Sunflower Bouquet',
    userName: 'Kavita Patel',
    rating: 5,
    title: 'Bright and cheery! Exceptional yarn quality.',
    comment: 'The yellow yarn has a premium subtle sheen and does not fray at all. Stems are easily posable so you can arrange them in any ceramic vase. Will definitely be a returning customer.',
    images: ['/products/bouquet_sunflower_yellow.png'],
    verifiedPurchase: true,
    helpfulCount: 11,
    daysAgo: 14,
  },
  {
    productSlug: 'pink-lotus-pearl-toran',
    productName: 'Pink Lotus & Pearl Toran',
    userName: 'Pooja Kulkarni',
    rating: 5,
    title: 'Pure artistry. So neat and symmetric.',
    comment: 'The delicate lotus motifs paired with the little pearls look so divine at our pooja room entrance. It feels authentic and handcrafted with devotion. Thank you Aura Craft!',
    images: ['/products/crochet_toran_pink_lotus.png'],
    verifiedPurchase: true,
    helpfulCount: 28,
    daysAgo: 18,
  },
  {
    productSlug: 'purple-spring-tulip-bouquet',
    productName: 'Purple Spring Tulip Bouquet',
    userName: 'Sneha Roy',
    rating: 4,
    title: 'Subtle pastel purple, lovely aesthetic.',
    comment: 'Very pretty tulips! The shade of lilac purple is soothing and looks great next to my books on the shelf. Dispatch took 2 days as it was freshly handmade, but totally worth the wait.',
    images: ['/products/bouquet_purple_tulips.png'],
    verifiedPurchase: true,
    helpfulCount: 9,
    daysAgo: 21,
  },
  {
    productSlug: 'Teddy Gift Hamper',
    productName: 'Teddy Gift Hamper',
    userName: 'Aditya Nair',
    rating: 5,
    title: 'Packed like a luxury boutique hamper!',
    comment: 'Gifted this for my sister’s baby shower. The handmade crochet teddy is so gentle and soft. The ribbon and personalized gift card made it feel extra special. 10/10.',
    images: ['/uploads/1788500859287-403471157-teddygifthamper.png'],
    verifiedPurchase: true,
    helpfulCount: 16,
    daysAgo: 25,
  }
];

async function seedReviews() {
  console.log('Fetching products to map IDs...');
  const prodSnap = await getDocs(collection(db, 'products'));
  const products = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(`Found ${products.length} products in database.`);

  for (const review of SAMPLE_PHOTO_REVIEWS) {
    const matchedProduct = products.find(p => 
      p.slug === review.productSlug || 
      p.name?.toLowerCase() === review.productName?.toLowerCase() ||
      p.name?.toLowerCase().includes(review.productName?.toLowerCase())
    );

    const productId = matchedProduct ? matchedProduct.id : products[0]?.id;
    const finalProductName = matchedProduct ? matchedProduct.name : review.productName;
    const finalProductSlug = matchedProduct ? matchedProduct.slug : review.productSlug;
    const finalProductImage = matchedProduct?.images?.[0]?.url || matchedProduct?.image || review.images[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - (review.daysAgo || 5));

    const reviewDoc = {
      productId: productId,
      productName: finalProductName,
      productSlug: finalProductSlug,
      productImage: finalProductImage,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images,
      verifiedPurchase: review.verifiedPurchase,
      helpfulCount: review.helpfulCount,
      status: 'APPROVED',
      createdAt: Timestamp.fromDate(pastDate),
    };

    await addDoc(collection(db, 'reviews'), reviewDoc);
    console.log(`Added photo review by ${review.userName} for "${finalProductName}"`);
  }

  console.log('Successfully seeded Amazon-style Customer Photo Reviews!');
  process.exit(0);
}

seedReviews().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
