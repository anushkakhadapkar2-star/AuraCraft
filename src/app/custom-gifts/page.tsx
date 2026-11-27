import { Metadata } from "next";
import { CustomGiftsClient } from "./CustomGiftsClient";

export const metadata: Metadata = {
  title: "Custom Gifts & Personalized Hampers | Aura Craft",
  description: "Customize your handcrafted crochet gift with everlasting blooms, luxury packaging, and a personalized wax-sealed handwritten note for your loved ones.",
};

export default function CustomGiftsPage() {
  return (
    <div className="pb-24 w-full">
      <CustomGiftsClient />
    </div>
  );
}
