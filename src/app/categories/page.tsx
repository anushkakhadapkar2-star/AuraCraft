import { db as serverDb } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default async function CategoriesPage() {
  const categoriesSnap = await getDocs(collection(serverDb, "categories"));
  
  const categories = categoriesSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(c => c.status === true)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">All Categories</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our complete collection of handmade crafts, flowers, and unique decor pieces.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/shop?category=${category.slug}`} className="group relative rounded-2xl overflow-hidden aspect-square bg-zinc-100 flex items-center justify-center">
            {category.image && (
              <Image src={category.image} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="relative z-10 flex flex-col items-center p-4 text-center">
              <h3 className="text-white font-serif font-bold text-2xl mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-white/80 text-sm hidden group-hover:block transition-all">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
