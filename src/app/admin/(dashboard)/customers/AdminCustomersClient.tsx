"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Mail,
  Phone,
  ShoppingBag,
  ShieldAlert,
  Users,
  Calendar,
  ShieldCheck,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Eye,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function AdminCustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CUSTOMER" | "ADMIN">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCustomers = useMemo(() => {
    const s = search.toLowerCase();
    return (initialCustomers || []).filter(c => {
      const nameMatch =
        c.firstName?.toLowerCase().includes(s) ||
        c.lastName?.toLowerCase().includes(s) ||
        c.name?.toLowerCase().includes(s) ||
        `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase().includes(s);
      const emailMatch = c.email?.toLowerCase().includes(s);
      const phoneMatch = c.phone?.toLowerCase().includes(s);
      const searchOk = nameMatch || emailMatch || phoneMatch;

      const role = c.role || "CUSTOMER";
      const roleOk = roleFilter === "ALL" || role === roleFilter;

      return searchOk && roleOk;
    });
  }, [initialCustomers, search, roleFilter]);

  const customerCount = initialCustomers?.filter(c => (c.role || "CUSTOMER") !== "ADMIN").length || 0;
  const adminCount = initialCustomers?.filter(c => c.role === "ADMIN").length || 0;

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safeCurrentPage, pageSize]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F4EE] text-[#563A29]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E9DCCB]/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
                Customer Community
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
                {initialCustomers?.length || 0} Registered Patrons
              </span>
            </div>
            <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
              View customer profiles, contact channels, joined dates, and privileges.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Patrons</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{initialCustomers?.length || 0}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5">Verified customer base</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Artisan Patrons</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{customerCount}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5">Customer accounts</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1e3a8a]">Store Administrators</div>
            <div className="text-xl font-bold font-serif text-[#1e3a8a] mt-1">{adminCount}</div>
            <div className="text-[11px] text-[#1e3a8a]/80 mt-0.5">Full operations managers</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "ALL", label: "All Members", count: initialCustomers?.length || 0 },
              { id: "CUSTOMER", label: "Patrons", count: customerCount },
              { id: "ADMIN", label: "Admins", count: adminCount }
            ].map(tab => {
              const isActive = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id as any)}
                  className={`btn-press flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${isActive
                      ? "bg-[#563A29] text-white shadow-xs"
                      : "bg-[#F8F4EE] text-[#563A29]/80 hover:bg-[#E9DCCB]/60 hover:text-[#563A29]"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#E9DCCB] text-[#563A29]"
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-[#E9DCCB]/60 w-full" />

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, or phone..."
              className="w-full bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl pl-9.5 pr-8 py-2 text-xs font-medium text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#563A29]/50 hover:text-[#563A29]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl border border-[#E9DCCB] shadow-xs overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DCCB]/40 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-[#563A29]/60" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#563A29]">No customers found</h3>
              <p className="text-xs text-[#563A29]/60 max-w-sm mt-1">
                Try modifying your search criteria or resetting the filters.
              </p>
              {(search || roleFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("ALL");
                  }}
                  className="btn-press mt-4 px-4 py-1.5 rounded-xl bg-[#563A29] text-white text-xs font-semibold hover:bg-[#3d2719] transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F8F4EE]/80 border-b border-[#E9DCCB] text-[#563A29]/70 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Patron Name & ID</th>
                    <th className="py-3.5 px-3">Contact Channels</th>
                    <th className="py-3.5 px-3">Registration Date</th>
                    <th className="py-3.5 px-3">Account Role</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs font-sans">
                  {paginatedCustomers.map((customer) => {
                    const fullName = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer Patron";
                    const initial = fullName[0] || customer.phone?.[0] || "C";
                    const isAdmin = customer.role === "ADMIN";

                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="group hover:bg-[#F8F4EE]/70 transition-colors duration-150 cursor-pointer"
                      >
                        {/* Name & ID */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E9DCCB] text-[#563A29] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {initial.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-[#563A29] truncate max-w-[200px]">
                                {fullName}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#563A29]/60 font-mono">
                                <span>ID: #{customer.id.substring(0, 8)}</span>
                                <button
                                  onClick={(e) => handleCopyId(customer.id, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-[#563A29]/60 hover:text-[#563A29]"
                                  title="Copy user ID"
                                >
                                  {copiedId === customer.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contacts */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-[#563A29] font-medium">
                                <Phone className="w-3 h-3 text-[#CDAE91]" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1.5 text-[#563A29]/70">
                                <Mail className="w-3 h-3 text-[#CDAE91]" />
                                <span className="truncate max-w-[180px]">{customer.email}</span>
                              </div>
                            )}
                            {!customer.phone && !customer.email && (
                              <span className="text-[#563A29]/40 italic">No direct contact listed</span>
                            )}
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 text-[#563A29]/80">
                            <Calendar className="w-3.5 h-3.5 text-[#CDAE91]" />
                            <span>
                              {customer.createdAt
                                ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })
                                : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isAdmin
                              ? "bg-[#dbeafe] text-[#1e3a8a] border-[#bfdbfe]"
                              : "bg-[#c3e8ca] text-[#0f5223] border-[#86efac]"
                            }`}>
                            {isAdmin ? <ShieldCheck className="w-3 h-3" /> : null}
                            <span>{isAdmin ? "Admin" : "Customer"}</span>
                          </span>
                        </td>

                        {/* Quick Contact Actions */}
                        <td className="py-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-2">
                            {customer.phone && (
                              <a
                                href={`https://wa.me/91${customer.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-press px-2.5 py-1 rounded-lg bg-[#F8F4EE] border border-[#E9DCCB] text-[#0f5223] font-semibold text-[11px] hover:bg-[#E9DCCB]/50 transition-all min-touch flex items-center gap-1"
                              >
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="btn-press p-1.5 rounded-lg text-[#563A29]/70 hover:text-[#563A29] hover:bg-[#E9DCCB]/40 transition-all min-touch"
                              title="Inspect profile"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredCustomers.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#E9DCCB] bg-[#F8F4EE]/50 text-xs text-[#563A29]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#563A29]/70">
                      Showing{" "}
                      <strong className="text-[#563A29]">
                        {(safeCurrentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-[#563A29]">
                        {Math.min(safeCurrentPage * pageSize, filteredCustomers.length)}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-[#563A29]">{filteredCustomers.length}</strong> patrons
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[#563A29]/60">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E9DCCB] rounded-lg px-2 py-1 text-xs text-[#563A29] font-medium focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all min-touch"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <span key={p} className="flex items-center">
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-[#563A29]/40">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(p)}
                              className={`btn-press w-8 h-8 rounded-lg text-xs font-semibold transition-all ${safeCurrentPage === p
                                  ? "bg-[#563A29] text-white"
                                  : "border border-[#E9DCCB] bg-white text-[#563A29] hover:bg-[#F8F4EE]"
                                }`}
                            >
                              {p}
                            </button>
                          </span>
                        );
                      })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      className="btn-press p-2 rounded-lg border border-[#E9DCCB] bg-white text-[#563A29] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F4EE] transition-all min-touch"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Slide-out Customer Details Drawer */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="w-full max-w-md bg-[#F8F4EE] h-full shadow-2xl border-l border-[#E9DCCB] flex flex-col justify-between animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#E9DCCB] bg-white flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#563A29]">
                  {selectedCustomer.name || `${selectedCustomer.firstName || ""} ${selectedCustomer.lastName || ""}`.trim() || "Customer Profile"}
                </h2>
                <p className="text-xs text-[#563A29]/60 font-mono mt-0.5">
                  ID: #{selectedCustomer.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-press p-2 rounded-xl text-[#563A29]/60 hover:text-[#563A29] hover:bg-[#F8F4EE] transition-all min-touch"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              {/* Member Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9DCCB] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#563A29]/60 block">Account Status</span>
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#563A29]">
                    {selectedCustomer.role === "ADMIN" ? "Administrator" : "Artisan Patron"}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${selectedCustomer.role === "ADMIN" ? "bg-[#dbeafe] text-[#1e3a8a] border-[#bfdbfe]" : "bg-[#c3e8ca] text-[#0f5223] border-[#86efac]"
                    }`}>
                    Active
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9DCCB] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#563A29]/60 block">Contact Information</span>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1 border-b border-[#E9DCCB]/50">
                    <span className="text-[#563A29]/70 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#CDAE91]" /> Mobile
                    </span>
                    <span className="font-bold text-[#563A29]">{selectedCustomer.phone || "Not provided"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#E9DCCB]/50">
                    <span className="text-[#563A29]/70 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#CDAE91]" /> Email
                    </span>
                    <span className="font-bold text-[#563A29] truncate max-w-[200px]">{selectedCustomer.email || "Not provided"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#563A29]/70 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#CDAE91]" /> Joined
                    </span>
                    <span className="font-bold text-[#563A29]">
                      {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="bg-white p-5 rounded-2xl border border-[#E9DCCB] shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#563A29]/60 block">Direct Channels</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCustomer.phone && (
                    <a
                      href={`https://wa.me/91${selectedCustomer.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-press flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#E4E8DE] border border-[#A4AD91]/50 text-[#2B3320] font-bold text-xs"
                    >
                      <span>WhatsApp Chat</span>
                    </a>
                  )}
                  {selectedCustomer.email && (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="btn-press flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E9DCCB] text-[#563A29] font-bold text-xs"
                    >
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-[#E9DCCB] bg-white flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-press px-5 py-2 rounded-xl bg-[#563A29] text-white font-bold text-xs hover:bg-[#3d2719] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
