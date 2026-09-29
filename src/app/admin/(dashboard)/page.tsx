import { db as serverDb } from "@/lib/firebase/client";
import { collection, getCountFromServer as getCount } from "firebase/firestore";
import { RevenueChart, OrdersChart } from "@/components/admin/DashboardCharts";
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Eye,
  FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboard() {
  const usersSnap = await getCount(collection(serverDb, "users"));
  const productsSnap = await getCount(collection(serverDb, "products"));
  const ordersSnap = await getCount(collection(serverDb, "orders"));

  const totalUsers = usersSnap.data().count;
  const totalProducts = productsSnap.data().count;
  const totalOrders = ordersSnap.data().count;

  // Mock data for Top Products
  const TOP_PRODUCTS = [
    { id: 1, name: "Pink Crochet Rose", sku: "AC-CR-PNK", sold: 145, revenue: 43500, image: "https://images.unsplash.com/photo-1515276427842-f85802d514a2?auto=format&fit=crop&q=80&w=150" },
    { id: 2, name: "Sunflower Bouquet", sku: "AC-BQ-SUN", sold: 98, revenue: 58800, image: "https://images.unsplash.com/photo-1599827552599-4f51e0db01cb?auto=format&fit=crop&q=80&w=150" },
    { id: 3, name: "Decorative Toran", sku: "AC-TR-01", sold: 76, revenue: 15200, image: "https://images.unsplash.com/photo-1615526676136-2244bbd1b585?auto=format&fit=crop&q=80&w=150" },
  ];

  // Mock data for Recent Orders
  const RECENT_ORDERS = [
    { id: "ORD-9821", customer: "Priya Sharma", product: "Sunflower Bouquet", amount: 600, status: "Processing", date: "Today, 10:45 AM" },
    { id: "ORD-9820", customer: "Rahul Verma", product: "Pink Crochet Rose", amount: 300, status: "Pending", date: "Today, 09:15 AM" },
    { id: "ORD-9819", customer: "Sneha Patel", product: "Lavender Lamp", amount: 1200, status: "Shipped", date: "Yesterday" },
    { id: "ORD-9818", customer: "Amit Kumar", product: "Gift Hamper", amount: 2500, status: "Delivered", date: "Yesterday" },
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="font-headline-md text-2xl font-bold text-primary mb-1">Dashboard Overview</h1>
          <p className="text-on-surface-variant">Here is what is happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface text-primary border border-outline-variant/50 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors shadow-sm">
            <FileText className="w-4 h-4" /> Export Report
          </button>
          <Link href="/admin/products/new" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-tertiary transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/50 text-primary flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> 12.5%
            </span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-primary">₹1,24,500</h3>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> 8.2%
            </span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-primary">{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/50 text-tertiary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium mb-1">Total Customers</p>
            <h3 className="text-2xl font-bold text-primary">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-error-container/50 text-error flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-error bg-error/10 px-2 py-1 rounded-full">Action Needed</span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium mb-1">Low Stock Products</p>
            <h3 className="text-2xl font-bold text-primary">12</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-primary">Revenue Overview</h3>
            <select className="text-sm border-none bg-surface-container-low rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <RevenueChart />
        </div>
        
        <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-primary">Orders Activity</h3>
            <select className="text-sm border-none bg-surface-container-low rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <OrdersChart />
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="xl:col-span-1 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-bold text-lg text-primary">Top Selling</h3>
            <Link href="/admin/products" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {TOP_PRODUCTS.map((prod) => (
                <div key={prod.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30">
                    <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-on-surface truncate">{prod.name}</h4>
                    <p className="text-xs text-on-surface-variant truncate">SKU: {prod.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary">₹{prod.revenue.toLocaleString()}</p>
                    <p className="text-xs text-on-surface-variant">{prod.sold} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-bold text-lg text-primary">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary">{order.id}</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{order.date}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-on-surface">{order.customer}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-on-surface-variant truncate max-w-[150px]">{order.product}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-on-surface">₹{order.amount}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                        ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
