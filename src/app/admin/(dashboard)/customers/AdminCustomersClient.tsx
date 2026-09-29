"use client";

import { useState } from "react";
import { Search, Mail, Phone, ShoppingBag, ShieldAlert } from "lucide-react";

export default function AdminCustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [search, setSearch] = useState("");
  
  const filteredCustomers = initialCustomers.filter(c => {
    const s = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(s) ||
      c.lastName?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary font-body-md"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
              <th className="p-4 font-label-caps text-on-surface-variant">Customer</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Contact</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Joined On</th>
              <th className="p-4 font-label-caps text-on-surface-variant">Role</th>
              <th className="p-4 font-label-caps text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline-sm uppercase">
                      {customer.firstName?.[0] || customer.phone?.[0] || "?"}
                    </div>
                    <div>
                      <div className="font-headline-sm text-primary">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-on-surface-variant">ID: {customer.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Mail className="w-4 h-4" /> {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Phone className="w-4 h-4" /> {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-on-surface-variant font-body-md">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    customer.role === 'ADMIN' ? 'bg-[#c3e8ca] text-[#0f5223]' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {customer.role || 'CUSTOMER'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors" title="View Orders">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Ban/Flag User">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-md">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
