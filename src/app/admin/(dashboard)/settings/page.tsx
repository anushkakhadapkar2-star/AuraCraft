"use client";

import { useState } from "react";
import { Save, ShieldAlert, Store, Truck, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "shipping" | "payments" | "security">("store");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Store Settings</h1>
        <p className="text-on-surface-variant">Configure your store, shipping zones, and security protocols.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <button 
            onClick={() => setActiveTab("store")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline-sm transition-colors ${activeTab === "store" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            <Store className="w-5 h-5" /> Store Details
          </button>
          <button 
            onClick={() => setActiveTab("shipping")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline-sm transition-colors ${activeTab === "shipping" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            <Truck className="w-5 h-5" /> Shipping
          </button>
          <button 
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline-sm transition-colors ${activeTab === "payments" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            <CreditCard className="w-5 h-5" /> Payments
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline-sm transition-colors ${activeTab === "security" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            <ShieldAlert className="w-5 h-5" /> Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-surface rounded-3xl border border-outline-variant/30 soft-shadow p-6 md:p-8">
          
          {activeTab === "store" && (
            <div className="space-y-6 fade-in-up">
              <h2 className="font-headline-md text-primary border-b border-outline-variant/30 pb-4">Store Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Store Name</label>
                  <input type="text" defaultValue="Aura Craft" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Support Email</label>
                  <input type="email" defaultValue="support@auracraft.com" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-on-surface-variant mb-2">Store Description</label>
                  <textarea rows={3} defaultValue="Handmade Pieces That Add a Little Magic to Everyday Life." className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 fade-in-up">
              <h2 className="font-headline-md text-primary border-b border-outline-variant/30 pb-4">Security Policies</h2>
              
              <div className="p-4 bg-[#fff8e1] text-[#b8860b] rounded-xl flex gap-3 border border-[#f5deb3]">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <p className="font-body-md text-sm">Two-Factor Authentication is currently enforced for all Admin accounts via Mobile OTP.</p>
              </div>

              <div className="space-y-4 pt-4">
                <label className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-xl">
                  <div>
                    <h4 className="font-headline-sm text-primary">Require Email Verification</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Force customers to verify email before checkout.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-primary rounded" />
                </label>
              </div>
            </div>
          )}

          {(activeTab === "shipping" || activeTab === "payments") && (
            <div className="flex flex-col items-center justify-center py-20 text-center fade-in-up">
              <Store className="w-16 h-16 text-on-surface-variant/30 mb-4" />
              <h3 className="font-headline-md text-primary">Module Not Configured</h3>
              <p className="text-on-surface-variant mt-2 max-w-sm">Please integrate Razorpay and Shiprocket to configure these settings.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-end">
            <button className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors">
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
