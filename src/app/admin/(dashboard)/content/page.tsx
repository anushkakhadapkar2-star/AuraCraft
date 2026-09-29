import { Metadata } from "next";
import ContentClient from "./ContentClient";

export const metadata: Metadata = {
  title: "Admin Content | Aura Craft",
};

export default function AdminContentPage() {
  return <ContentClient />;
}
