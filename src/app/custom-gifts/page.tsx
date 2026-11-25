import { Metadata } from "next";
import { CustomGiftsClient } from "./CustomGiftsClient";

export const metadata: Metadata = {
  title: "Custom Gifts & Personalized Hampers | Aura Craft",
  description: "Customize your handcrafted crochet gift with everlasting blooms, luxury packaging, and a personalized wax-sealed handwritten note for your loved ones.",
};

export default function CustomGiftsPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F8] pt-6 sm:pt-10 pb-24">
      <CustomGiftsClient />
    </main>
  );
}
