import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export const metadata = {
  title: "Admin Reviews | Aura Craft",
};

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Customer Reviews</h1>
        <p className="text-on-surface-variant">Moderate and reply to product reviews from your customers.</p>
      </div>

      <AdminReviewsClient />
    </div>
  );
}
