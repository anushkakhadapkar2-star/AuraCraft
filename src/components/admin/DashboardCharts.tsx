"use client";

import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 10500 },
  { name: 'Sun', revenue: 7300 },
];

const ORDER_DATA = [
  { name: 'Week 1', orders: 120 },
  { name: 'Week 2', orders: 150 },
  { name: 'Week 3', orders: 110 },
  { name: 'Week 4', orders: 190 },
];

const CATEGORY_DATA = [
  { name: 'Crochet Flowers', value: 4500 },
  { name: 'Macrame', value: 3000 },
  { name: 'Torans', value: 2500 },
  { name: 'Bouquets', value: 1500 },
];
const COLORS = ['#6f4e37', '#b08d70', '#d4c4b7', '#a0522d'];

const TOP_PRODUCTS_DATA = [
  { name: 'Sunflower Bouquet', sales: 420 },
  { name: 'Rose Macrame', sales: 380 },
  { name: 'Lavender Toran', sales: 310 },
  { name: 'Tulip Setup', sales: 250 },
  { name: 'Daisy Bundle', sales: 210 },
];

const TRAFFIC_DATA = [
  { name: 'Instagram', value: 55 },
  { name: 'Organic Search', value: 25 },
  { name: 'Direct', value: 15 },
  { name: 'Referral', value: 5 },
];
const TRAFFIC_COLORS = ['#E1306C', '#4285F4', '#34A853', '#FBBC05'];

export function RevenueChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6f4e37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6f4e37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value}`} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`₹${value}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#6f4e37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ORDER_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="orders" fill="#b08d70" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesByCategoryChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={CATEGORY_DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {CATEGORY_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`₹${value}`, 'Revenue']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopSellingProductsChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={TOP_PRODUCTS_DATA} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={100} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="sales" fill="#b08d70" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficSourcesChart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={TRAFFIC_DATA}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {TRAFFIC_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Traffic Share']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
