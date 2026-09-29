const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword123', 10);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@auracraft.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@auracraft.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // 2. Create Categories
  const categories = [
    { name: 'Crochet Flowers', slug: 'crochet-flowers', description: 'Handcrafted crochet flowers' },
    { name: 'Crochet Bouquets', slug: 'crochet-bouquets', description: 'Beautiful crochet flower bouquets' },
    { name: 'Home Decor', slug: 'home-decor', description: 'Aesthetic home decorations' },
    { name: 'Gift Hampers', slug: 'gift-hampers', description: 'Curated gift hampers for your loved ones' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 3. Create sample products
  const productsToSeed = [
    {
      name: 'Sunflower Crochet',
      slug: 'sunflower-crochet',
      sku: 'CF-SUN-001',
      description: 'A beautiful handmade crochet sunflower to brighten your day.',
      shortDescription: 'Handmade crochet sunflower',
      price: 399,
      status: 'ACTIVE',
      categorySlug: 'crochet-flowers',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1597826361849-5e7e1e479a32?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Pastel Rose Bouquet',
      slug: 'pastel-rose-bouquet',
      sku: 'CB-ROS-002',
      description: 'An elegant arrangement of handcrafted crochet roses in soft pastel shades.',
      shortDescription: 'Handcrafted crochet rose bouquet',
      price: 1299,
      status: 'ACTIVE',
      categorySlug: 'crochet-bouquets',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Minimalist Ceramic Vase',
      slug: 'minimalist-ceramic-vase',
      sku: 'HD-VAS-003',
      description: 'A beautifully textured handmade ceramic vase perfect for dried or crochet flowers.',
      shortDescription: 'Handmade ceramic vase',
      price: 899,
      status: 'ACTIVE',
      categorySlug: 'home-decor',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Aromatic Soy Candle',
      slug: 'aromatic-soy-candle',
      sku: 'GH-CAN-004',
      description: 'Hand-poured aromatic soy candle infused with calming lavender essential oils.',
      shortDescription: 'Hand-poured soy candle',
      price: 499,
      status: 'ACTIVE',
      categorySlug: 'gift-hampers',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Woven Cotton Tote',
      slug: 'woven-cotton-tote',
      sku: 'HD-TOT-005',
      description: 'An intricately handwoven cotton tote bag perfect for everyday essentials.',
      shortDescription: 'Handwoven cotton tote',
      price: 749,
      status: 'ACTIVE',
      categorySlug: 'home-decor',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=600&auto=format&fit=crop'
    }
  ];

  for (const prod of productsToSeed) {
    const category = await prisma.category.findUnique({ where: { slug: prod.categorySlug } });
    if (!category) continue;

    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        status: prod.status,
        categoryId: category.id,
        isFeatured: prod.isFeatured,
      },
    });

    const existingInv = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if (!existingInv) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          currentStock: 25,
        }
      });
      await prisma.productImage.create({
        data: {
          url: prod.imageUrl,
          isPrimary: true,
          productId: product.id,
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
