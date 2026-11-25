"use client";

import { useState, useEffect, useMemo } from "react";
import { Tag, Plus, Loader2, Copy, Check, Trash2, Power, Search, AlertCircle, X, Sparkles, Percent, DollarSign } from "lucide-react";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function CouponClient() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showFeedback("success", `Coupon code "${code}" copied to clipboard.`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue) return;

    setIsSubmitting(true);
    try {
      const newCoupon = {
        code: formData.code.toUpperCase().replace(/\s/g, ''),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "coupons"), newCoupon);
      setFormData({ code: "", discountType: "PERCENTAGE", discountValue: "" });
      setIsModalOpen(false);
      showFeedback("success", `Coupon "${newCoupon.code}" created successfully.`);
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      showFeedback("error", "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateDoc(doc(db, "coupons", id), { status: newStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      showFeedback("success", `Coupon status set to ${newStatus}.`);
    } catch (error) {
      console.error("Error updating coupon:", error);
      showFeedback("error", "Failed to update status.");
    }
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "coupons", couponToDelete.id));
      setCoupons(prev => prev.filter(c => c.id !== couponToDelete.id));
      showFeedback("success", `Coupon "${couponToDelete.code}" deleted.`);
      setCouponToDelete(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showFeedback("error", "Failed to delete coupon.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c =>
      c.code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [coupons, search]);

  const activeCount = useMemo(() => coupons.filter(c => c.status === "ACTIVE").length, [coupons]);
  const inactiveCount = useMemo(() => coupons.filter(c => c.status !== "ACTIVE").length, [coupons]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F4EE] text-[#563A29]">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-3 ${feedback.type === "success" ? "bg-[#2B3320] border border-[#A4AD91]" : "bg-[#ba1a1a] border border-red-300"
            }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 text-[#CDAE91]" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E9DCCB]/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
                Marketing & Coupons
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
                {activeCount} Live Offers
              </span>
            </div>
            <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
              Create promotional discount codes, festive vouchers, and free shipping incentives.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-press btn-shimmer w-full md:w-auto flex items-center justify-center gap-2 bg-[#563A29] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-xs cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-[#CDAE91]" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Coupons</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{coupons.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">All generated codes</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Active Campaigns</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{activeCount}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Redeemable at checkout</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Inactive / Paused</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{inactiveCount}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Expired or disabled</div>
          </div>
          <div className="bg-gradient-to-br from-[#563A29] to-[#3d2719] text-white rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E9DCCB]/80">Primary Promo</div>
            <div className="text-xl font-bold font-serif mt-1">WELCOME10</div>
            <div className="text-[11px] text-[#CDAE91] mt-0.5 font-medium">Default welcome code</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
            <input
              type="text"
              placeholder="Search coupon by code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8F4EE] border border-[#E9DCCB] rounded-xl pl-9.5 pr-8 py-2 text-xs font-medium text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#563A29]/50 hover:text-[#563A29] p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs text-[#563A29]/70 font-medium">
            Showing <strong className="text-[#563A29]">{filteredCoupons.length}</strong> of {coupons.length} coupons
          </div>
        </div>

        {/* Coupons Table Card */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#563A29] mx-auto mb-2" />
            <p className="text-xs text-[#563A29]/70 font-medium">Loading promotional campaigns...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#CDAE91] flex items-center justify-center mx-auto mb-4 border border-[#E9DCCB]">
              <Tag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#563A29] mb-1">No Active Campaigns Found</h2>
            <p className="text-xs text-[#563A29]/70 max-w-sm mx-auto mb-6">
              {search ? `No coupons matching "${search}".` : "Create your first coupon code to start offering discounts to your shoppers."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-press btn-shimmer inline-flex items-center gap-2 px-6 py-2.5 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-xs min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#CDAE91]" />
              <span>Create Coupon</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E9DCCB] text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70">
                    <th className="py-3.5 px-6">Coupon Code</th>
                    <th className="py-3.5 px-6">Discount Benefit</th>
                    <th className="py-3.5 px-6">Discount Type</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DCCB]/60 text-xs">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-xs bg-[#FAF7F2] text-[#563A29] px-3 py-1.5 rounded-lg border border-[#CDAE91]/60 tracking-wider">
                            {coupon.code}
                          </code>
                          <button
                            onClick={(e) => handleCopyCode(coupon.code, e)}
                            className="btn-press p-1.5 rounded-lg text-[#563A29]/50 hover:text-[#563A29] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E9DCCB] transition-all"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#563A29]">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <span className="inline-flex items-center gap-1 text-[#0f5223] font-serif text-sm">
                            <Percent className="w-3.5 h-3.5" />
                            {coupon.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#563A29] font-serif text-sm">
                            ₹{coupon.discountValue} OFF Flat
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-[#563A29]/75 font-medium">
                        {coupon.discountType === "PERCENTAGE" ? "Percentage Discount" : "Flat Cash Value"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${coupon.status === "ACTIVE"
                            ? "bg-[#c3e8ca] text-[#0f5223] border border-[#86efac]"
                            : "bg-[#F8F4EE] text-[#563A29]/60 border border-[#E9DCCB]"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${coupon.status === "ACTIVE" ? "bg-[#0f5223]" : "bg-[#563A29]/40"}`} />
                          {coupon.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(coupon.id, coupon.status)}
                            className="btn-press px-3 py-1.5 rounded-xl border border-[#E9DCCB] text-[11px] font-bold text-[#563A29] hover:bg-[#FAF7F2] transition-all min-h-[38px] inline-flex items-center gap-1.5"
                          >
                            <Power className="w-3 h-3 text-[#CDAE91]" />
                            <span>{coupon.status === "ACTIVE" ? "Pause" : "Activate"}</span>
                          </button>
                          <button
                            onClick={() => setCouponToDelete(coupon)}
                            className="btn-press p-2 rounded-xl border border-transparent hover:border-red-200 text-[#ba1a1a] hover:bg-red-50 transition-all min-h-[38px] min-w-[38px] inline-flex items-center justify-center cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E9DCCB] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Delete Coupon?</h3>
                <p className="text-xs text-[#563A29]/70">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#563A29]/80 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#E9DCCB]">
              Are you sure you want to delete <strong className="font-mono text-[#563A29]">{couponToDelete.code}</strong>? Customers will no longer be able to apply this code at checkout.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-[#FAF7F2] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCoupon}
                disabled={isDeleting}
                className="btn-press px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 min-h-[44px] inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Coupon</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E9DCCB] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="p-5 border-b border-[#E9DCCB] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CDAE91]" />
                <h2 className="font-serif font-bold text-lg text-[#563A29]">Create Promotional Coupon</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-press p-2 text-[#563A29]/60 hover:text-[#563A29] hover:bg-white rounded-full transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. DIWALI15 or AURA20"
                  required
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#563A29] uppercase focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px] cursor-pointer"
                >
                  <option value="PERCENTAGE">Percentage (%) Off</option>
                  <option value="FIXED">Fixed Amount (₹) Off</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                  Discount Value *
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'PERCENTAGE' ? "e.g. 15 (for 15%)" : "e.g. 200 (for ₹200)"}
                  required
                  min="1"
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#E9DCCB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-[#563A29] text-xs font-semibold hover:bg-[#FAF7F2] min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-press btn-shimmer flex items-center gap-2 bg-[#563A29] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-xs disabled:opacity-50 min-h-[44px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#CDAE91]" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#CDAE91]" />
                      <span>Create Coupon</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
