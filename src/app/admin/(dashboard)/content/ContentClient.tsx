"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import Image from "next/image";

export default function ContentClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shopUploadProgress, setShopUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shopFileInputRef = useRef<HTMLInputElement>(null);
  
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
      { icon: "chat_bubble", title: "CUSTOMER SUPPORT", line1: "+91 98765 43210", line2: "support@auracraft.com" },
      { icon: "schedule", title: "BUSINESS HOURS", line1: "Monday - Saturday", line2: "10:00 AM - 6:00 PM" },
      { icon: "local_shipping", title: "ORDER & DELIVERY", line1: "Need an Order Update?", line2: "+91 98765 43210" }
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
      
      updateData(prev => ({ ...prev, bannerUrl: data.url }));
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Clear progress after a brief moment
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
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
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully!`);
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-sm text-primary mb-2">Website Content</h1>
          <p className="text-on-surface-variant">Manage banners, promotions, and textual content across pages.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
          {(['home', 'shop', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-headline-sm transition-colors ${
                activeTab === tab 
                  ? 'bg-surface shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Page
            </button>
          ))}
        </div>
      </div>

      {/* Homepage Banner */}
      {activeTab === 'home' && (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden p-6 fade-in-up">
          <h2 className="font-headline-sm text-primary mb-6 border-b border-outline-variant/30 pb-4">Homepage Hero Banner</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div 
               className="relative aspect-[21/9] lg:aspect-video bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden"
               onClick={() => fileInputRef.current?.click()}
             >
                {formData.bannerUrl ? (
                  <Image src={formData.bannerUrl} alt="Banner Preview" fill className="object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-headline-sm text-on-surface-variant group-hover:text-primary transition-colors">Upload Desktop Banner</span>
                    <span className="text-xs text-on-surface-variant/70 mt-1">Recommended: 1920x1080px</span>
                  </>
                )}
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>{Math.round(uploadProgress)}%</span>
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
             
             <div className="space-y-4">
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Heading Text</label>
                   <input 
                     type="text" 
                     name="headingText"
                     value={formData.headingText}
                     onChange={handleInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Button Text</label>
                   <input 
                     type="text" 
                     name="buttonText"
                     value={formData.buttonText}
                     onChange={handleInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Button Link URL</label>
                   <input 
                     type="text" 
                     name="buttonLink"
                     value={formData.buttonLink}
                     onChange={handleInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <button 
                  onClick={() => handleSave('home')}
                  disabled={isSaving || uploadProgress > 0}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save Content"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Shop Promo Banner */}
      {activeTab === 'shop' && (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden p-6 fade-in-up">
          <h2 className="font-headline-sm text-primary mb-6 border-b border-outline-variant/30 pb-4">Shop Page Promo Banner</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div 
               className="relative aspect-[21/9] lg:aspect-video bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden"
               onClick={() => shopFileInputRef.current?.click()}
             >
                {shopFormData.bannerUrl ? (
                  <Image src={shopFormData.bannerUrl} alt="Shop Banner Preview" fill className="object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-headline-sm text-on-surface-variant group-hover:text-primary transition-colors">Upload Shop Promo Image</span>
                    <span className="text-xs text-on-surface-variant/70 mt-1">Recommended: 800x600px</span>
                  </>
                )}
                
                {shopUploadProgress > 0 && shopUploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>{Math.round(shopUploadProgress)}%</span>
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
             
             <div className="space-y-4">
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Heading Text</label>
                   <input 
                     type="text" 
                     name="headingText"
                     value={shopFormData.headingText}
                     onChange={handleShopInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Subtext</label>
                   <input 
                     type="text" 
                     name="subText"
                     value={shopFormData.subText}
                     onChange={handleShopInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <div>
                   <label className="block font-label-caps text-on-surface-variant mb-2">Discount Badge Text</label>
                   <input 
                     type="text" 
                     name="discountBadge"
                     value={shopFormData.discountBadge}
                     onChange={handleShopInputChange}
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                   />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-label-caps text-on-surface-variant mb-2">Button Text</label>
                    <input 
                      type="text" 
                      name="buttonText"
                      value={shopFormData.buttonText}
                      onChange={handleShopInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-label-caps text-on-surface-variant mb-2">Button Link URL</label>
                    <input 
                      type="text" 
                      name="buttonLink"
                      value={shopFormData.buttonLink}
                      onChange={handleShopInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('shop')}
                  disabled={isSaving || shopUploadProgress > 0}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save Shop Content"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* About Page Content */}
      {activeTab === 'about' && (
        <div className="space-y-6 fade-in-up">
          {/* Hero Section */}
          <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden p-6">
            <h2 className="font-headline-sm text-primary mb-6 border-b border-outline-variant/30 pb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                 <label className="block font-label-caps text-on-surface-variant mb-2">Heading</label>
                 <input 
                   type="text" 
                   name="heroHeading"
                   value={aboutFormData.heroHeading}
                   onChange={handleAboutInputChange}
                   className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
                 />
              </div>
              <div>
                 <label className="block font-label-caps text-on-surface-variant mb-2">Subtext</label>
                 <textarea 
                   name="heroSubText"
                   rows={2}
                   value={aboutFormData.heroSubText}
                   onChange={handleAboutInputChange}
                   className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md resize-none" 
                 />
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden p-6">
            <h2 className="font-headline-sm text-primary mb-6 border-b border-outline-variant/30 pb-4">Contact Info Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aboutFormData.contactCards.map((card, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 space-y-4">
                  <h3 className="font-label-caps text-primary border-b border-outline-variant/20 pb-2">Card {idx + 1}</h3>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Icon (Material Symbol)</label>
                    <input type="text" value={card.icon} onChange={(e) => updateAboutCard('contactCards', idx, 'icon', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Title</label>
                    <input type="text" value={card.title} onChange={(e) => updateAboutCard('contactCards', idx, 'title', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Line 1</label>
                    <input type="text" value={card.line1} onChange={(e) => updateAboutCard('contactCards', idx, 'line1', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Line 2</label>
                    <input type="text" value={card.line2} onChange={(e) => updateAboutCard('contactCards', idx, 'line2', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden p-6">
            <h2 className="font-headline-sm text-primary mb-6 border-b border-outline-variant/30 pb-4">Features Section ("Why Choose Us")</h2>
            <div className="mb-6">
              <label className="block font-label-caps text-on-surface-variant mb-2">Section Heading</label>
              <input 
                type="text" 
                name="featuresHeading"
                value={aboutFormData.featuresHeading}
                onChange={handleAboutInputChange}
                className="w-full max-w-md bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutFormData.features.map((feature, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 space-y-4">
                  <h3 className="font-label-caps text-primary border-b border-outline-variant/20 pb-2">Feature {idx + 1}</h3>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Icon (Material Symbol)</label>
                    <input type="text" value={feature.icon} onChange={(e) => updateAboutCard('features', idx, 'icon', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Title</label>
                    <input type="text" value={feature.title} onChange={(e) => updateAboutCard('features', idx, 'title', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Description</label>
                    <textarea rows={2} value={feature.desc} onChange={(e) => updateAboutCard('features', idx, 'desc', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end sticky bottom-6 z-10">
            <button 
              onClick={() => handleSave('about')}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-70 shadow-lg"
            >
              {isSaving ? "Saving..." : "Save About Page Content"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
