import { Metadata } from "next";
import CouponClient from "./CouponClient";

export const metadata: Metadata = {
  title: "Admin Marketing | Aura Craft",
};

export default function AdminMarketingPage() {
  return <CouponClient />;
}
