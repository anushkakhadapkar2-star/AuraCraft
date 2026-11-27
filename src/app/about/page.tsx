import { db as serverDb } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "About Us - Aura Craft",
  description: "Learn more about Aura Craft and get in touch.",
};

const DEFAULT_CONTENT = {
  heroHeading: "Let's Connect",
  heroSubText: "Have a question about our crafts, your order, or anything else? We're always happy to help.",
  contactCards: [
    { icon: "chat_bubble", title: "CUSTOMER SUPPORT", line1: "+91 98765 43210", line2: "support@auracraft.com" },
    { icon: "schedule", title: "BUSINESS HOURS", line1: "Monday - Saturday", line2: "10:00 AM - 6:00 PM" },
    { icon: "local_shipping", title: "ORDER & DELIVERY", line1: "Need an Order Update?", line2: "+91 98765 43210" }
  ],
  featuresHeading: "Why Choose Aura Craft?",
  features: [
    { icon: "wb_sunny", title: "Thoughtfully Designed", desc: "Every craft is created with purpose to encourage curiosity and meaningful decor." },
    { icon: "architecture", title: "Premium Craftsmanship", desc: "Thoughtfully crafted with quality materials and attention to detail." },
    { icon: "grid_view", title: "Artisan Made", desc: "Designed to encourage creativity and independent exploration." },
    { icon: "shield", title: "Safe & Sustainable", desc: "Designed with joyful everyday living in mind." },
    { icon: "bolt", title: "Built for Durability", desc: "Encourage exploration and develop confidence through quality items." },
    { icon: "star", title: "Made for Growing Homes", desc: "Beautiful crafts that inspire imagination while creating meaningful memories." }
  ]
};

export default async function AboutPage() {
  let content = DEFAULT_CONTENT;

  try {
    const snap = await getDoc(doc(serverDb, "settings", "aboutpage"));
    if (snap.exists()) {
      content = { ...DEFAULT_CONTENT, ...snap.data() } as typeof DEFAULT_CONTENT;
    }
  } catch (error) {
    console.error("Error fetching about page content:", error);
  }

  return (
    <div className="pb-20 w-full">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-16 fade-in-up">
          <p className="font-label-caps text-on-surface-variant/70 mb-4 tracking-widest">WE'RE HERE TO HELP</p>
          <h1 className="font-display-lg text-primary mb-6">{content.heroHeading}</h1>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            {content.heroSubText}
          </p>
        </section>

        {/* Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 fade-in-up" style={{ animationDelay: '0.1s' }}>
          {content.contactCards.map((card, idx) => (
            <div key={idx} className="bg-surface rounded-3xl p-8 border border-outline-variant/30 soft-shadow hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <h3 className="font-label-caps text-primary mb-4">{card.title}</h3>
              <div className="space-y-2 font-body-md text-on-surface-variant">
                <p>{card.line1}</p>
                <p>{card.line2}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Contact Form */}
        <section className="mb-32 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <ContactForm />
        </section>

        {/* Features / Why Choose Us */}
        <section className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-16">
            <p className="font-label-caps text-on-surface-variant/70 mb-4 tracking-widest">THE AURA CRAFT DIFFERENCE</p>
            <h2 className="font-display-md text-primary">{content.featuresHeading}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, idx) => (
              <div key={idx} className="bg-surface rounded-3xl p-8 border border-outline-variant/30 soft-shadow hover:-translate-y-1 transition-transform duration-300 text-center">
                <div className="inline-flex w-14 h-14 rounded-full bg-surface-container-low items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                </div>
                <h3 className="font-headline-sm text-primary mb-3">{feature.title}</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
