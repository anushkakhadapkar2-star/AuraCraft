"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Refined Aura Craft palette tokens
const AURA_COLORS = {
  primary: "#563A29",     // Deep Artisan Espresso
  secondary: "#8B5E3C",   // Warm Terracotta Brown
  accent: "#CDAE91",      // Warm Gold / Beige
  muted: "#E9DCCB",       // Soft Cream Border
  sage: "#A4AD91",        // Sage Green (Healthy / Verified)
  rose: "#D45B7A",        // Artisan Rose
  bg: "#FAF7F2",          // Cream Canvas
  textMuted: "#7D6B5E"    // Muted Cocoa Text
};

const REVENUE_DATA = [
  { name: 'Mon', revenue: 4200, orders: 8 },
  { name: 'Tue', revenue: 3800, orders: 7 },
  { name: 'Wed', revenue: 6400, orders: 12 },
  { name: 'Thu', revenue: 5100, orders: 9 },
  { name: 'Fri', revenue: 9800, orders: 16 },
  { name: 'Sat', revenue: 14200, orders: 24 },
  { name: 'Sun', revenue: 11500, orders: 19 },
];

const ORDER_DATA = [
  { name: 'Week 1', completed: 48, pending: 6 },
  { name: 'Week 2', completed: 62, pending: 8 },
  { name: 'Week 3', completed: 55, pending: 5 },
  { name: 'Week 4', completed: 78, pending: 11 },
];

const CATEGORY_DATA = [
  { name: 'Crochet Flowers', value: 38 },
  { name: 'Crochet Bouquets', value: 32 },
  { name: 'Home Décor & Torans', value: 18 },
  { name: 'Gift Hampers', value: 12 },
];
const CATEGORY_COLORS = [AURA_COLORS.primary, AURA_COLORS.secondary, AURA_COLORS.accent, AURA_COLORS.sage];

const TOP_PRODUCTS_DATA = [
  { name: 'Sunflower Duo Bouquet', sales: 48, revenue: 38400 },
  { name: 'Blooming Pink Lily', sales: 41, revenue: 32800 },
  { name: 'Festive Marigold Toran', sales: 34, revenue: 27200 },
  { name: 'Vintage Lavender Bundle', sales: 28, revenue: 22400 },
  { name: 'White Daisy Flower Pot', sales: 22, revenue: 17600 },
];

const TRAFFIC_DATA = [
  { name: 'Instagram & Social', value: 54 },
  { name: 'Direct / Organic', value: 28 },
  { name: 'WhatsApp Inquiries', value: 12 },
  { name: 'Referral & Word of Mouth', value: 6 },
];
const TRAFFIC_COLORS = [AURA_COLORS.rose, AURA_COLORS.primary, AURA_COLORS.sage, AURA_COLORS.accent];

// Custom Elegant Tooltip Component
function CustomChartTooltip({ active, payload, label, prefix = "₹", suffix = "" }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#E9DCCB] shadow-[0_8px_20px_rgba(86,58,41,0.08)] text-xs">
        <p className="font-semibold text-[#7D6B5E] mb-1 text-[11px] uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-[#7D6B5E]">{entry.name}:</span>
            <span className="font-serif font-bold text-[#36251A]">
              {prefix}{Number(entry.value).toLocaleString("en-IN")}{suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data = REVENUE_DATA }: { data?: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[280px] flex flex-col items-center justify-center text-center text-[#7D6B5E] text-xs">
        <p>No revenue data recorded for this time range.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="auraRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={AURA_COLORS.primary} stopOpacity={0.22} />
              <stop offset="95%" stopColor={AURA_COLORS.accent} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DCCB" strokeOpacity={0.7} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#7D6B5E', fontWeight: 600 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#7D6B5E' }}
            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
          />
          <Tooltip content={<CustomChartTooltip prefix="₹" />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={AURA_COLORS.primary}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#auraRevenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data = ORDER_DATA }: { data?: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[280px] flex flex-col items-center justify-center text-center text-[#7D6B5E] text-xs">
        <p>No fulfillment data recorded for this time range.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }} barSize={26}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DCCB" strokeOpacity={0.7} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#7D6B5E', fontWeight: 600 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#7D6B5E' }}
          />
          <Tooltip content={<CustomChartTooltip prefix="" suffix=" orders" />} />
          <Bar dataKey="completed" name="Completed" fill={AURA_COLORS.primary} radius={[6, 6, 0, 0]} />
          <Bar dataKey="pending" name="In Progress" fill={AURA_COLORS.accent} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesByCategoryChart() {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={CATEGORY_DATA}
            cx="50%"
            cy="46%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {CATEGORY_DATA.map((_, index) => (
              <Cell
                key={`cat-cell-${index}`}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomChartTooltip prefix="" suffix="%" />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-[#7D6B5E] font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopSellingProductsChart() {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={TOP_PRODUCTS_DATA}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 10, bottom: 0 }}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9DCCB" strokeOpacity={0.7} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#7D6B5E' }}
            tickFormatter={(v) => `${v} sold`}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#36251A', fontWeight: 600 }}
            width={130}
          />
          <Tooltip content={<CustomChartTooltip prefix="" suffix=" units" />} />
          <Bar dataKey="sales" name="Units Sold" fill={AURA_COLORS.secondary} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficSourcesChart() {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={TRAFFIC_DATA}
            cx="50%"
            cy="46%"
            innerRadius={50}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {TRAFFIC_DATA.map((_, index) => (
              <Cell
                key={`traffic-cell-${index}`}
                fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomChartTooltip prefix="" suffix="%" />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-[#7D6B5E] font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
