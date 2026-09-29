import { 
  RevenueChart, 
  OrdersChart, 
  SalesByCategoryChart, 
  TopSellingProductsChart, 
  TrafficSourcesChart 
} from "@/components/admin/DashboardCharts";

export const metadata = {
  title: "Admin Analytics | Aura Craft",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Detailed Analytics</h1>
        <p className="text-on-surface-variant">Deep dive into your store's performance, revenue trends, and traffic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow">
          <h2 className="font-headline-sm text-primary mb-6">Revenue Overview</h2>
          <RevenueChart />
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow">
          <h2 className="font-headline-sm text-primary mb-6">Orders Overview</h2>
          <OrdersChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow lg:col-span-1">
             <h3 className="font-headline-sm text-primary mb-6">Sales by Category</h3>
             <SalesByCategoryChart />
         </div>
         <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow lg:col-span-1">
             <h3 className="font-headline-sm text-primary mb-6">Top Selling Products</h3>
             <TopSellingProductsChart />
         </div>
         <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow lg:col-span-1">
             <h3 className="font-headline-sm text-primary mb-6">Traffic Sources</h3>
             <TrafficSourcesChart />
         </div>
      </div>
    </div>
  );
}
