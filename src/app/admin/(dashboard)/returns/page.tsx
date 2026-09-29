import { RefreshCcw, PackageX } from "lucide-react";

export const metadata = {
  title: "Admin Returns | Aura Craft",
};

export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Returns & Refunds</h1>
        <p className="text-on-surface-variant">Manage customer return requests and issue refunds.</p>
      </div>

      <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <PackageX className="w-16 h-16 text-on-surface-variant/30 mb-4" />
        <h2 className="font-headline-md text-primary mb-2">No Active Returns</h2>
        <p className="text-on-surface-variant max-w-sm">All return requests have been processed. When a customer initiates a return from their order history, it will appear here.</p>
        
        <button className="mt-8 flex items-center gap-2 px-6 py-3 bg-surface-container-low text-primary border border-outline-variant hover:bg-surface-container btn-radius font-headline-sm transition-colors">
          <RefreshCcw className="w-4 h-4" />
          Refresh List
        </button>
      </div>
    </div>
  );
}
