"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Loader2 } from "lucide-react";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function CouponClient() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
  });

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

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) return;
    
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
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateDoc(doc(db, "coupons", id), { status: newStatus });
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display-sm text-primary mb-2">Marketing & Coupons</h1>
          <p className="text-on-surface-variant">Create discount codes and flash sales for your customers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <Tag className="w-16 h-16 text-on-surface-variant/30 mb-4" />
          <h2 className="font-headline-md text-primary mb-2">No Active Campaigns</h2>
          <p className="text-on-surface-variant max-w-sm">Create your first coupon code to start offering discounts to your customers.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant/30 font-label-caps text-label-caps text-on-surface-variant">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Coupon Code</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-headline-sm text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-wider ${
                        coupon.status === "ACTIVE" ? "bg-[#c3e8ca] text-[#0f5223]" : "bg-error/10 text-error"
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.status)}
                        className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {coupon.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button 
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-sm font-semibold text-error hover:text-error/80 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-primary">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-primary">✕</button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. SUMMER20" 
                  required
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Discount Type</label>
                <select 
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Discount Value</label>
                <input 
                  type="number" 
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'PERCENTAGE' ? "e.g. 20" : "e.g. 500"} 
                  required
                  min="1"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 focus:border-primary outline-none" 
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 btn-radius border border-outline-variant text-on-surface font-headline-sm hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-on-primary py-3 btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
