"use client";

import { useState, useEffect } from "react";
import { Save, ShieldAlert, Store, Truck, CreditCard, Check, Loader2, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "shipping" | "payments" | "security">("store");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    storeName: "Aura Craft",
    supportEmail: "support@auracraft.com",
    supportPhone: "+91 93244 88603",
    storeDescription: "Handmade Pieces That Add a Little Magic to Everyday Life.",
    currency: "INR (₹)",
    freeShippingThreshold: 1000,
    standardShippingFee: 50,
    codEnabled: true,
    onlinePaymentEnabled: true,
    requireEmailVerification: false,
    otpLoginEnabled: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "general"));
        if (snap.exists()) {
          setFormData(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(doc(db, "settings", "general"), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setSaveError(err.message || "Failed to save settings");
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-[#563A29]">
      {/* Toast Feedback */}
      {(saveSuccess || saveError) && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-3 ${saveSuccess ? "bg-[#2B3320] border border-[#A4AD91]" : "bg-[#ba1a1a] border border-red-300"
            }`}
        >
          {saveSuccess ? <Check className="w-4 h-4 text-[#CDAE91]" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{saveSuccess ? "Store settings updated successfully." : saveError}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E9DCCB]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
              Store Settings
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
              System Config
            </span>
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Manage artisan storefront preferences, delivery rules, checkout rates, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-press btn-shimmer flex items-center gap-2 bg-[#563A29] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Settings Tabs Sidebar */}
          <div className="w-full md:w-64 space-y-1.5 flex-shrink-0">
            {[
              { id: "store", label: "Store Details", icon: Store },
              { id: "shipping", label: "Shipping & Delivery", icon: Truck },
              { id: "payments", label: "Payment Gateways", icon: CreditCard },
              { id: "security", label: "Security & Access", icon: ShieldAlert },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn-press w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-serif text-sm font-bold transition-all text-left cursor-pointer ${isActive
                      ? "bg-[#563A29] text-white shadow-xs"
                      : "bg-white text-[#563A29]/70 hover:bg-[#FAF7F2] hover:text-[#563A29] border border-[#E9DCCB]"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#CDAE91]" : "text-[#563A29]/60"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Panel Content */}
          <div className="flex-1 bg-white rounded-3xl border border-[#E9DCCB] shadow-xs p-6 md:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#563A29] animate-spin mb-2" />
                <p className="text-xs text-[#7D6B5E]">Loading store configurations...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">

                {/* Store Tab */}
                {activeTab === "store" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="border-b border-[#E9DCCB] pb-3">
                      <h2 className="font-serif text-lg font-bold text-[#563A29]">Store Information</h2>
                      <p className="text-xs text-[#7D6B5E] mt-0.5">Core branding and support contacts displayed to shoppers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Brand / Store Name
                        </label>
                        <input
                          type="text"
                          value={formData.storeName}
                          onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                          className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Customer Support Email
                        </label>
                        <input
                          type="email"
                          value={formData.supportEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                          className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Helpline / WhatsApp Number
                        </label>
                        <input
                          type="text"
                          value={formData.supportPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
                          className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Catalog Currency
                        </label>
                        <input
                          type="text"
                          disabled
                          value={formData.currency}
                          className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Artisan Mission / Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.storeDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, storeDescription: e.target.value }))}
                          className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Tab */}
                {activeTab === "shipping" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="border-b border-[#E9DCCB] pb-3">
                      <h2 className="font-serif text-lg font-bold text-[#563A29]">Shipping & Dispatch Rates</h2>
                      <p className="text-xs text-[#7D6B5E] mt-0.5">Control delivery charges, free shipping tiers, and courier policies.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl p-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Free Shipping Minimum (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.freeShippingThreshold}
                          onChange={(e) => setFormData(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) || 0 }))}
                          className="w-full bg-white border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29]"
                        />
                        <p className="text-[11px] text-[#7D6B5E] mt-1.5">
                          Orders above ₹{formData.freeShippingThreshold} qualify for free delivery across India.
                        </p>
                      </div>

                      <div className="bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl p-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                          Standard Shipping Fee (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.standardShippingFee}
                          onChange={(e) => setFormData(prev => ({ ...prev, standardShippingFee: Number(e.target.value) || 0 }))}
                          className="w-full bg-white border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29]"
                        />
                        <p className="text-[11px] text-[#7D6B5E] mt-1.5">
                          Applied to orders below the free shipping threshold.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="border-b border-[#E9DCCB] pb-3">
                      <h2 className="font-serif text-lg font-bold text-[#563A29]">Payment Gateways</h2>
                      <p className="text-xs text-[#7D6B5E] mt-0.5">Toggle supported customer payment methods at checkout.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl cursor-pointer">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#563A29]">Cash on Delivery (COD)</h4>
                          <p className="text-xs text-[#7D6B5E] mt-0.5">Allow shoppers to pay cash upon doorstep package arrival.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.codEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, codEnabled: e.target.checked }))}
                          className="w-5 h-5 rounded text-[#563A29] focus:ring-[#563A29] cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl cursor-pointer">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#563A29]">Online Payment Simulation (UPI & Cards)</h4>
                          <p className="text-xs text-[#7D6B5E] mt-0.5">Enable digital payments via UPI and credit/debit cards.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.onlinePaymentEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, onlinePaymentEnabled: e.target.checked }))}
                          className="w-5 h-5 rounded text-[#563A29] focus:ring-[#563A29] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="border-b border-[#E9DCCB] pb-3">
                      <h2 className="font-serif text-lg font-bold text-[#563A29]">Security & Authentication</h2>
                      <p className="text-xs text-[#7D6B5E] mt-0.5">Control customer sign-in security and verification policies.</p>
                    </div>

                    <div className="p-4 bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-[#CDAE91] shrink-0" />
                      <p className="text-xs text-[#563A29]">
                        Real-time OTP verification via phone number and email is active.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl cursor-pointer">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#563A29]">Phone & Email OTP Sign-in</h4>
                          <p className="text-xs text-[#7D6B5E] mt-0.5">Allow frictionless login via one-time passwords.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.otpLoginEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, otpLoginEnabled: e.target.checked }))}
                          className="w-5 h-5 rounded text-[#563A29] focus:ring-[#563A29] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Save Confirmation */}
                <div className="pt-4 border-t border-[#E9DCCB] flex items-center justify-between">
                  {saveSuccess && (
                    <div className="flex items-center gap-1.5 text-xs text-[#0f5223] font-bold animate-in fade-in duration-200">
                      <Check className="w-4 h-4" />
                      <span>Settings saved to live database!</span>
                    </div>
                  )}
                  <div className="ml-auto">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-press btn-shimmer flex items-center gap-2 bg-[#563A29] text-white px-6 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? "Saving..." : "Save Settings"}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
