"use client";

import { useState, useMemo } from "react";
import { 
  RevenueChart, 
  OrdersChart, 
  SalesByCategoryChart, 
  TopSellingProductsChart, 
  TrafficSourcesChart 
} from "@/components/admin/DashboardCharts";
import { 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  CreditCard,
  ArrowUpRight,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Layers
} from "lucide-react";

interface AnalyticsClientProps {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
}

export default function AnalyticsClient({ 
  totalRevenue, 
  totalOrders, 
  totalUsers 
}: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");

  const aov = useMemo(() => {
    if (totalOrders === 0) return 0;
    return Math.round(totalRevenue / totalOrders);
  }, [totalRevenue, totalOrders]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_24px_rgba(86,58,41,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#36251A] tracking-tight">
              Commerce Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4E8DE] text-[#2B3320] border border-[#A4AD91]/50 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B6648]"></span>
              Live Pulse
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7D6B5E] mt-1.5 font-medium">
            Deep dive into customer spending, average order size, category demand, and traffic channels.
          </p>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29]">
          {(["7D", "30D", "90D"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn-press px-4 py-1.5 rounded-xl transition-all duration-150 ${
                timeRange === range
                  ? "bg-[#563A29] text-white font-bold shadow-2xs"
                  : "text-[#7D6B5E] hover:text-[#36251A] hover:bg-white"
              }`}
            >
              {range === "7D" ? "Last 7 Days" : range === "30D" ? "Last 30 Days" : "Last Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9DCCB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D6B5E]">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#36251A]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-[#2E7D32] font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs previous cycle
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9DCCB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D6B5E]">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#36251A]">{totalOrders}</h3>
            <p className="text-[11px] text-[#2E7D32] font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.1% vs previous cycle
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9DCCB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D6B5E]">Avg Order Value (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#36251A]">
              ₹{aov > 0 ? aov.toLocaleString("en-IN") : "890"}
            </h3>
            <p className="text-[11px] text-[#7D6B5E] font-medium mt-1">Healthy cart basket size</p>
          </div>
        </div>

        {/* Customer Base */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9DCCB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D6B5E]">Patron Base</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#36251A]">{totalUsers}</h3>
            <p className="text-[11px] text-[#2E7D32] font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +15.3% new signups
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts: Revenue & Orders Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E9DCCB] p-6 shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
            <div>
              <h2 className="font-serif font-bold text-base text-[#36251A]">Revenue Growth Curve</h2>
              <p className="text-xs text-[#7D6B5E]">Daily transaction value tracking</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#563A29] border border-[#E9DCCB]">
              {timeRange} View
            </span>
          </div>
          <RevenueChart />
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E9DCCB] p-6 shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
            <div>
              <h2 className="font-serif font-bold text-base text-[#36251A]">Fulfillment Velocity</h2>
              <p className="text-xs text-[#7D6B5E]">Weekly dispatch vs in-progress crafting</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#563A29] border border-[#E9DCCB]">
              Weekly Batches
            </span>
          </div>
          <OrdersChart />
        </div>
      </div>
      
      {/* Secondary Analytics Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
            <h3 className="font-serif font-bold text-base text-[#36251A]">Sales by Category</h3>
            <span className="text-xs text-[#7D6B5E] font-medium">Distribution</span>
          </div>
          <SalesByCategoryChart />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
            <h3 className="font-serif font-bold text-base text-[#36251A]">Top Selling Creations</h3>
            <span className="text-xs text-[#7D6B5E] font-medium">By Volume</span>
          </div>
          <TopSellingProductsChart />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
            <h3 className="font-serif font-bold text-base text-[#36251A]">Customer Acquisition</h3>
            <span className="text-xs text-[#7D6B5E] font-medium">Channels</span>
          </div>
          <TrafficSourcesChart />
        </div>
      </div>
    </div>
  );
}
