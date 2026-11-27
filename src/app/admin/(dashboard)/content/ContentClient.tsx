"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Loader2, Sparkles, Check, AlertCircle, Save, ExternalLink, Globe, Layout, Info } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";

export default function ContentClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shopUploadProgress, setShopUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shopFileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tabs for managing different pages
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'about'>('home');

  const [formData, setFormData] = useState({
    headingText: "Handmade Pieces That Add a Little Magic to Everyday Life.",
    buttonText: "Shop the Collection",
    buttonLink: "/shop",
    bannerUrl: "",
  });

  const [shopFormData, setShopFormData] = useState({
    headingText: "Spring Sale is Live!",
    subText: "Enjoy up to 40% off on selected collections.",
    buttonText: "Explore Deals",
    buttonLink: "/shop?sort=price_asc",
    bannerUrl: "",
    discountBadge: "UP TO 40% OFF"
  });

  const [aboutFormData, setAboutFormData] = useState({
    heroHeading: "Let's Connect",
    heroSubText: "Have a question about our crafts, your order, or anything else? We're always happy to help.",
    contactCards: [
      { icon: "chat_bubble", title: "CUSTOMER SUPPORT", line1: "+91 93244 88603", line2: "support@auracraft.com" },
      { icon: "schedule", title: "BUSINESS HOURS", line1: "Monday - Saturday", line2: "10:00 AM - 6:00 PM" },
      { icon: "local_shipping", title: "ORDER & DELIVERY", line1: "Need an Order Update?", line2: "+91 93244 88603" }
    ],
    featuresHeading: "Why Choose Aura Craft?",
    features: [
      { icon: "wb_sunny", title: "Thoughtfully Designed", desc: "Every craft is created with purpose to encourage curiosity and meaningful decor." },
      { icon: "architecture", title: "Premium Craftsmanship", desc: "Thoughtfully crafted with quality materials and attention to detail." },
      { icon: "grid_view", title: "Artisan Made", desc: "Designed to encourage creativity and independent exploration." },
      { icon: "shield", title: "Safe & Sustainable", desc: "Designed with joyful everyday living in mind." },
      { icon: "bolt", title: "Built for Durability", desc: "Encourage exploration and develop confidence through quality items." },
      { icon: "star", title: "Made for Growing Homes", desc: "Beautiful crafts that inspire imagination while creating meaningful memories." }
    ]
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [homeSnap, shopSnap, aboutSnap] = await Promise.all([
          getDoc(doc(db, "settings", "homepage")),
          getDoc(doc(db, "settings", "shoppage")),
          getDoc(doc(db, "settings", "aboutpage"))
        ]);

        if (homeSnap.exists()) setFormData(prev => ({ ...prev, ...homeSnap.data() }));
        if (shopSnap.exists()) setShopFormData(prev => ({ ...prev, ...shopSnap.data() }));
        if (aboutSnap.exists()) setAboutFormData(prev => ({ ...prev, ...aboutSnap.data() }));
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAboutInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAboutFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateAboutCard = (type: 'contactCards' | 'features', index: number, field: string, value: string) => {
    setAboutFormData(prev => {
      const updatedArray = [...prev[type]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [type]: updatedArray };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isShop: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setProgress = isShop ? setShopUploadProgress : setUploadProgress;
    const updateData = isShop ? setShopFormData : setFormData;

    try {
      setProgress(10);

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      updateData((prev: any) => ({ ...prev, bannerUrl: data.url }));
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
      showFeedback("success", `${isShop ? "Shop promo" : "Homepage"} image uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading image:", error);
      showFeedback("error", "Failed to upload image.");
      setProgress(0);
    }
  };

  const handleSave = async (section: 'home' | 'shop' | 'about') => {
    setIsSaving(true);
    try {
      if (section === 'home') {
        await setDoc(doc(db, "settings", "homepage"), formData);
      } else if (section === 'shop') {
        await setDoc(doc(db, "settings", "shoppage"), shopFormData);
      } else {
        await setDoc(doc(db, "settings", "aboutpage"), aboutFormData);
      }
      showFeedback("success", `${section.charAt(0).toUpperCase() + section.slice(1)} page content published.`);
    } catch (error) {
      console.error("Error saving content:", error);
      showFeedback("error", "Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#563A29]/60">
        <Loader2 className="w-8 h-8 animate-spin text-[#563A29] mb-3" />
        <p className="text-xs font-semibold">Loading CMS content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#563A29]">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E9DCCB]/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
              Storefront CMS & Content
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Update marketing copy, seasonal hero banners, contact cards, and artisan value propositions.
          </p>
        </div>

        {/* Segmented Page Tabs */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-[#E9DCCB] shadow-xs">
          {(['home', 'shop', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn-press px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize min-h-[38px] ${activeTab === tab
                  ? 'bg-[#563A29] text-white shadow-xs'
                  : 'text-[#563A29]/70 hover:text-[#563A29] hover:bg-[#FAF7F2]'
                }`}
            >
              {tab === "home" ? "Homepage" : tab === "shop" ? "Shop Page" : "About & Info"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Homepage Hero Editor */}
        {activeTab === 'home' && (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] shadow-xs overflow-hidden p-6 sm:p-8 animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E9DCCB] pb-4">
              <div className="flex items-center gap-2.5">
                <Layout className="w-5 h-5 text-[#CDAE91]" />
                <h2 className="font-serif font-bold text-lg text-[#563A29]">Homepage Hero Banner & Call-to-Action</h2>
              </div>
              <span className="text-xs text-[#563A29]/60 font-medium">Rendered above the fold on /</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Image Uploader */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-2">
                  Hero Imagery Preview
                </label>
                <div
                  className="relative aspect-[16/9] bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#CDAE91] hover:border-[#563A29] flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden shadow-2xs"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to replace banner"
                >
                  {formData.bannerUrl ? (
                    <Image src={formData.bannerUrl} alt="Banner Preview" fill className="object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-10 h-10 text-[#CDAE91] group-hover:text-[#563A29] mb-2 mx-auto transition-colors" />
                      <span className="font-semibold text-xs text-[#563A29] block">Upload Hero Banner</span>
                      <span className="text-[11px] text-[#563A29]/60 mt-1 block">Recommended: 1920 × 1080px (PNG or WebP)</span>
                    </div>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-[#CDAE91] mb-2" />
                      <span className="text-xs font-bold">{Math.round(uploadProgress)}% Uploading...</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e, false)}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Headline Text</label>
                  <input
                    type="text"
                    name="headingText"
                    value={formData.headingText}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Button Label</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Button Destination Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-mono text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleSave('home')}
                    disabled={isSaving || uploadProgress > 0}
                    className="btn-press btn-shimmer w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-xs disabled:opacity-50 min-h-[44px] cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CDAE91]" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#CDAE91]" />
                        <span>Save & Publish Homepage</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop Promo Banner */}
        {activeTab === 'shop' && (
          <div className="bg-white rounded-3xl border border-[#E9DCCB] shadow-xs overflow-hidden p-6 sm:p-8 animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E9DCCB] pb-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#CDAE91]" />
                <h2 className="font-serif font-bold text-lg text-[#563A29]">Shop Catalog Header Promo Banner</h2>
              </div>
              <span className="text-xs text-[#563A29]/60 font-medium">Rendered on /shop</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Image Uploader */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-2">
                  Promo Visual Preview
                </label>
                <div
                  className="relative aspect-[16/9] bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#CDAE91] hover:border-[#563A29] flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden shadow-2xs"
                  onClick={() => shopFileInputRef.current?.click()}
                  title="Click to replace promo banner"
                >
                  {shopFormData.bannerUrl ? (
                    <Image src={shopFormData.bannerUrl} alt="Shop Banner Preview" fill className="object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-10 h-10 text-[#CDAE91] group-hover:text-[#563A29] mb-2 mx-auto transition-colors" />
                      <span className="font-semibold text-xs text-[#563A29] block">Upload Shop Promo Banner</span>
                      <span className="text-[11px] text-[#563A29]/60 mt-1 block">Recommended: 1200 × 600px</span>
                    </div>
                  )}

                  {shopUploadProgress > 0 && shopUploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-[#CDAE91] mb-2" />
                      <span className="text-xs font-bold">{Math.round(shopUploadProgress)}% Uploading...</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={shopFileInputRef}
                  onChange={(e) => handleImageUpload(e, true)}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Promotion Headline</label>
                  <input
                    type="text"
                    name="headingText"
                    value={shopFormData.headingText}
                    onChange={handleShopInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Subtext Details</label>
                  <input
                    type="text"
                    name="subText"
                    value={shopFormData.subText}
                    onChange={handleShopInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Discount Badge Pill</label>
                    <input
                      type="text"
                      name="discountBadge"
                      value={shopFormData.discountBadge}
                      onChange={handleShopInputChange}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">CTA Button Label</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={shopFormData.buttonText}
                      onChange={handleShopInputChange}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Button Destination Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={shopFormData.buttonLink}
                    onChange={handleShopInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-mono text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleSave('shop')}
                    disabled={isSaving || shopUploadProgress > 0}
                    className="btn-press btn-shimmer w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-xs disabled:opacity-50 min-h-[44px] cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CDAE91]" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#CDAE91]" />
                        <span>Save & Publish Shop Banner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Page Content */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl border border-[#E9DCCB] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E9DCCB] pb-3">
                <Info className="w-4 h-4 text-[#CDAE91]" />
                <h2 className="font-serif font-bold text-base text-[#563A29]">About Page Hero Header</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Heading</label>
                  <input
                    type="text"
                    name="heroHeading"
                    value={aboutFormData.heroHeading}
                    onChange={handleAboutInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">Subtext</label>
                  <textarea
                    name="heroSubText"
                    rows={2}
                    value={aboutFormData.heroSubText}
                    onChange={handleAboutInputChange}
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl p-3 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="bg-white rounded-3xl border border-[#E9DCCB] p-6 shadow-xs space-y-4">
              <h2 className="font-serif font-bold text-base text-[#563A29] border-b border-[#E9DCCB] pb-3">Contact Information Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aboutFormData.contactCards.map((card, idx) => (
                  <div key={idx} className="bg-[#FAF7F2] border border-[#E9DCCB] rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#563A29] border-b border-[#E9DCCB] pb-2">Card #{idx + 1}</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-[#563A29]/70 mb-1">Title</label>
                      <input type="text" value={card.title} onChange={(e) => updateAboutCard('contactCards', idx, 'title', e.target.value)} className="w-full bg-white border border-[#E9DCCB] rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#563A29]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#563A29]/70 mb-1">Contact Line 1</label>
                      <input type="text" value={card.line1} onChange={(e) => updateAboutCard('contactCards', idx, 'line1', e.target.value)} className="w-full bg-white border border-[#E9DCCB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#563A29]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#563A29]/70 mb-1">Contact Line 2</label>
                      <input type="text" value={card.line2} onChange={(e) => updateAboutCard('contactCards', idx, 'line2', e.target.value)} className="w-full bg-white border border-[#E9DCCB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#563A29]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSave('about')}
                disabled={isSaving}
                className="btn-press btn-shimmer flex items-center justify-center gap-2 px-8 py-3 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-md disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#CDAE91]" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#CDAE91]" />
                    <span>Save About Page Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
