"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  UploadCloud,
  Loader2,
  Save,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  IndianRupee,
  Package,
  Globe
} from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";

type ImageType = { url: string; isPrimary: boolean; order: number };

export default function ProductForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    discountPrice: initialData?.discountPrice || "",
    status: initialData?.status || "ACTIVE",
    categoryId: initialData?.categoryId || "",
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || false,
    material: initialData?.material || "",
    dimensions: initialData?.dimensions || "",
    weight: initialData?.weight || "",
    currentStock: initialData?.inventory?.currentStock ?? 10,
    lowStockThreshold: initialData?.inventory?.lowStockThreshold ?? 5,
    metaTitle: initialData?.seo?.metaTitle || initialData?.metaTitle || "",
    metaDescription: initialData?.seo?.metaDescription || initialData?.metaDescription || "",
  });

  const [images, setImages] = useState<ImageType[]>(initialData?.images || []);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const snap = await getDocs(collection(db, "categories"));
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    }
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugify = () => {
    if (!formData.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    let newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadData = new FormData();
      uploadData.append("file", file);

      try {
        setUploadProgress(15);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image file");
        }

        const data = await response.json();

        newImages.push({
          url: data.url,
          isPrimary: newImages.length === 0,
          order: newImages.length + 1
        });

        setUploadProgress(100);
      } catch (error: any) {
        console.error("Upload failed", error);
        setError("Failed to upload image: " + error.message);
      }
    }

    setImages(newImages);
    setUploadProgress(null);
    e.target.value = '';
  };

  const setPrimaryImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(updated);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.name.trim() || !formData.slug.trim() || !formData.categoryId || Number(formData.price) <= 0) {
        throw new Error("Please complete the required fields: Product Name, Slug, Category, and Price (> 0).");
      }
      if (images.length === 0) {
        throw new Error("Please upload at least one product photo for customer browsing.");
      }

      const selectedCategory = categories.find(c => c.id === formData.categoryId);

      const productPayload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        sku: formData.sku.trim() || `AC-${Date.now().toString().slice(-4)}`,
        description: formData.description.trim(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        material: formData.material.trim(),
        dimensions: formData.dimensions.trim(),
        weight: formData.weight.trim(),
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name || "",
        categorySlug: selectedCategory?.slug || "",
        inventory: {
          currentStock: Number(formData.currentStock) || 0,
          lowStockThreshold: Number(formData.lowStockThreshold) || 5
        },
        seo: {
          metaTitle: formData.metaTitle.trim() || formData.name.trim(),
          metaDescription: formData.metaDescription.trim() || formData.description.slice(0, 160).trim(),
        },
        images: images,
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        await setDoc(doc(db, "products", initialData.id), productPayload, { merge: true });
      } else {
        await addDoc(collection(db, "products"), {
          ...productPayload,
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
      setIsLoading(false);
    }
  };

  // Stock status calculation
  const stockNum = Number(formData.currentStock) || 0;
  const thresholdNum = Number(formData.lowStockThreshold) || 5;
  const stockStatus =
    stockNum === 0 ? { label: "Out of Stock", color: "text-[#ba1a1a] bg-[#FFF1F0] border-[#FDD0CD]" } :
      stockNum <= thresholdNum ? { label: "Low Stock Warning", color: "text-[#92400e] bg-[#FEF3C7] border-[#FDE68A]" } :
        { label: "Optimal Stock", color: "text-[#2B3320] bg-[#E4E8DE] border-[#A4AD91]/50" };

  // Discount percentage calculation
  const priceNum = Number(formData.price) || 0;
  const discNum = Number(formData.discountPrice) || 0;
  const discountPercent = (priceNum > 0 && discNum > 0 && discNum < priceNum)
    ? Math.round(((priceNum - discNum) / priceNum) * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Bar with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_24px_rgba(86,58,41,0.03)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl text-[#7D6B5E] hover:text-[#36251A] hover:bg-[#FAF7F2] border border-[#E9DCCB] transition-colors min-touch flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#36251A]">
              {isEditing ? `Edit Craft: ${formData.name || initialData?.name}` : "Create New Artisan Craft"}
            </h1>
            <p className="text-xs text-[#7D6B5E]">
              {isEditing ? "Update specifications, images, and live inventory levels" : "Add a new handcrafted floral arrangement or bespoke gift"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7D6B5E] border border-[#E9DCCB] hover:bg-[#FAF7F2] transition-colors min-touch"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || uploadProgress !== null}
            className="btn-press flex items-center gap-2 px-6 py-2.5 bg-[#563A29] text-white rounded-xl text-xs font-bold hover:bg-[#36251A] transition-all shadow-xs disabled:opacity-60 min-touch"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditing ? "Update Craft" : "Publish Craft"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFF1F0] text-[#ba1a1a] p-4 rounded-2xl border border-[#FDD0CD] text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#E4E8DE] text-[#2B3320] p-4 rounded-2xl border border-[#A4AD91]/50 text-xs font-semibold flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Craft saved successfully! Redirecting to products catalog...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (8 Cols): Basic Info, Imagery, SEO */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9DCCB]">
              <Package className="w-4 h-4 text-[#563A29]" />
              <h2 className="font-serif font-bold text-base text-[#36251A]">Basic Information</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Craft Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                placeholder="e.g. Blooming Pink Lily Duo with Crochet Pot"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] focus:outline-none focus:ring-1 focus:ring-[#563A29] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#563A29] uppercase tracking-wider">
                    Slug <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSlugify}
                    className="text-[11px] font-semibold text-[#563A29] hover:underline"
                  >
                    Auto-generate
                  </button>
                </div>
                <input
                  required
                  type="text"
                  name="slug"
                  placeholder="blooming-pink-lily-duo"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-mono focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                  Stock Keeping Unit (SKU)
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="AC-LILY-01"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-mono focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Craft Description & Artisan Story
              </label>
              <textarea
                name="description"
                placeholder="Describe the yarns used, the artisan hand-stitching process, and gift occasions..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] focus:outline-none focus:ring-1 focus:ring-[#563A29] resize-y"
              />
            </div>
          </div>

          {/* Card 2: Craft Imagery */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#563A29]" />
                <h2 className="font-serif font-bold text-base text-[#36251A]">Artisan Photos & Gallery</h2>
              </div>
              <span className="text-[11px] text-[#7D6B5E]">{images.length} photos added</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-[#E9DCCB] bg-[#FAF7F2] group shadow-2xs"
                >
                  <Image src={img.url} alt={`Craft ${idx}`} fill sizes="160px" className="object-cover" />

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="px-2 py-1 bg-white text-[#563A29] rounded-lg text-[10px] font-bold shadow-xs hover:bg-[#FAF7F2]"
                        title="Set as Cover Image"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {img.isPrimary && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#563A29]/90 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider backdrop-blur-2xs">
                      Cover Photo
                    </div>
                  )}
                </div>
              ))}

              {/* Upload Drop Target */}
              <label className="relative aspect-square rounded-2xl border-2 border-dashed border-[#CDAE91] hover:border-[#563A29] bg-[#FAF7F2]/60 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all group min-touch">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadProgress !== null}
                  className="hidden"
                />
                {uploadProgress !== null ? (
                  <div className="text-center p-2">
                    <Loader2 className="w-6 h-6 text-[#563A29] animate-spin mx-auto mb-1.5" />
                    <span className="text-[11px] font-bold text-[#563A29]">{Math.round(uploadProgress)}%</span>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <UploadCloud className="w-6 h-6 text-[#7D6B5E] group-hover:text-[#563A29] mb-1.5 mx-auto transition-colors" />
                    <span className="text-xs font-bold text-[#563A29] block">Add Photo</span>
                    <span className="text-[10px] text-[#7D6B5E] block mt-0.5">JPG, PNG, WebP</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Card 3: SEO & Search Preview */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9DCCB]">
              <Globe className="w-4 h-4 text-[#563A29]" />
              <h2 className="font-serif font-bold text-base text-[#36251A]">SEO & Google Search Appearance</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                placeholder={formData.name || "Handmade Crochet Flowers & Gifts | Aura Craft"}
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] focus:outline-none focus:ring-1 focus:ring-[#563A29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                placeholder={formData.description.slice(0, 160) || "Discover artisan handcrafted crochet bouquets and gifts made with sustainable yarns..."}
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows={2}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] focus:outline-none focus:ring-1 focus:ring-[#563A29] resize-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column (4 Cols): Category, Pricing, Inventory, Flags */}
        <div className="lg:col-span-4 space-y-6">

          {/* Organization & Category */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9DCCB]">
              <Layers className="w-4 h-4 text-[#563A29]" />
              <h2 className="font-serif font-bold text-base text-[#36251A]">Catalog Placement</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-medium focus:outline-none focus:ring-1 focus:ring-[#563A29]"
              >
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-2">
                Publishing Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-medium focus:outline-none focus:ring-1 focus:ring-[#563A29]"
              >
                <option value="ACTIVE">Active (Live in Store)</option>
                <option value="DRAFT">Draft (Hidden from Shoppers)</option>
                <option value="INACTIVE">Archived</option>
              </select>
            </div>
          </div>

          {/* Pricing & Discounts */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#563A29]" />
                <h2 className="font-serif font-bold text-base text-[#36251A]">Pricing</h2>
              </div>
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E8DE] text-[#2B3320] border border-[#A4AD91]/50">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-1.5">
                  Regular Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 799"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-serif font-bold focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-1.5">
                  Sale / Discount Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional discounted price"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-serif font-bold focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
                <span className="text-[10px] text-[#7D6B5E] mt-1 block">Taxes included in retail prices.</span>
              </div>
            </div>
          </div>

          {/* Inventory & Stock Health */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DCCB]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#563A29]" />
                <h2 className="font-serif font-bold text-base text-[#36251A]">Stock Control</h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockStatus.color}`}>
                {stockStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-1.5">
                  Current Units
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-bold focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#563A29] uppercase tracking-wider mb-1.5">
                  Low Threshold
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs text-[#36251A] font-bold focus:outline-none focus:ring-1 focus:ring-[#563A29]"
                />
              </div>
            </div>
          </div>

          {/* Visibility Badges & Flags */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-4">
            <h2 className="font-serif font-bold text-base text-[#36251A] pb-3 border-b border-[#E9DCCB]">Artisan Badges</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-[#CDAE91] text-[#563A29] focus:ring-[#563A29]"
                />
                <span className="text-xs font-semibold text-[#36251A] group-hover:text-[#563A29] transition-colors">
                  Featured in Homepage Hero
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-[#CDAE91] text-[#563A29] focus:ring-[#563A29]"
                />
                <span className="text-xs font-semibold text-[#36251A] group-hover:text-[#563A29] transition-colors">
                  Artisan Best Seller
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-[#CDAE91] text-[#563A29] focus:ring-[#563A29]"
                />
                <span className="text-xs font-semibold text-[#36251A] group-hover:text-[#563A29] transition-colors">
                  New Arrival Collection
                </span>
              </label>
            </div>
          </div>

          {/* Material & Dimensions Specifications */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9DCCB] shadow-[0_4px_20px_rgba(86,58,41,0.03)] space-y-3">
            <h2 className="font-serif font-bold text-base text-[#36251A] pb-3 border-b border-[#E9DCCB]">Craft Dimensions</h2>

            <div>
              <label className="block text-[11px] font-bold text-[#7D6B5E] uppercase mb-1">Material</label>
              <input
                type="text"
                name="material"
                placeholder="100% Milk Cotton Yarn"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-3 py-2 text-xs text-[#36251A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#7D6B5E] uppercase mb-1">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                placeholder="30cm H x 15cm W"
                value={formData.dimensions}
                onChange={handleInputChange}
                className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-3 py-2 text-xs text-[#36251A]"
              />
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
