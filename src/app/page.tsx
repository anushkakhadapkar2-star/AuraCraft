import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export default async function Home() {
  const session = await auth();
  
  // Fetch dynamic content
  let content = null;
  try {
    const docRef = doc(db, "settings", "homepage");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      content = docSnap.data();
    }
  } catch (error) {
    console.error("Error fetching homepage content:", error);
  }

  const bannerUrl = content?.bannerUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuA9tvSnps6IHsJvimKcQ0dknXS8LRr4k0ymD7gMzAvuBgb5c61ttf5OgXAnABd1qmw_O20Dh8iiPY7UHU1B6BbkRaL581X5VdUZYEW_QRVSsqaG9MH9WWoAaXspWThN5M2UMzFAlwHksKrOILjkoLW5k4ICuF6s4dxNjcMHHOR8GZTcNnOTolE-YRl1G3sfom6zABts9tU6j_hHgKAkXzUiSfk1p7oEfrMODrxIxsXQhY9WEQ_CL1G28A";
  const headingText = content?.headingText || "Handmade Pieces That Add a Little Magic to Everyday Life.";
  const buttonText = content?.buttonText || "Shop Collection";
  const buttonLink = content?.buttonLink || "/shop";

  return (
    <div className="flex flex-col gap-stack-xl md:gap-[120px]">
      {/* Hero Section */}
      <section className="relative min-h-[716px] flex items-center justify-center rounded-3xl overflow-hidden mt-4 fade-in-up">
        <div className="absolute inset-0 z-0 bg-surface-dim">
          <Image 
            className="w-full h-full object-cover" 
            alt="Homepage Banner" 
            src={bannerUrl}
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/40 to-transparent md:bg-gradient-to-r md:from-surface/90 md:via-surface/50 md:to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl md:ml-0 md:mr-auto text-center md:text-left px-6 py-12 md:p-12 w-full">
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
            {headingText}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg mx-auto md:mx-0">
            Discover beautiful handcrafted flowers, décor and gifts designed to make everyday moments feel special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href={buttonLink} className="bg-primary text-on-primary px-8 py-3 btn-radius font-body-md text-body-md font-medium hover:bg-tertiary transition-colors flex items-center justify-center">
              {buttonText}
            </Link>
            <Link href="/shop?new=true" className="bg-transparent border border-outline-variant text-primary px-8 py-3 btn-radius font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors flex items-center justify-center">
              Explore New Arrivals
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
