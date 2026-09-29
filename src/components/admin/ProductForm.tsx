"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import { db, storage } from "@/lib/firebase/client";
import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

type ImageType = { url: string; isPrimary: boolean; order: number };

export default function ProductForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    discountPrice: initialData?.discountPrice || "",
    status: initialData?.status || "ACTIVE",
    categoryId: initialData?.categoryId || "",
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || false,
    material: initialData?.material || "",
    dimensions: initialData?.dimensions || "",
    weight: initialData?.weight || "",
    currentStock: initialData?.inventory?.currentStock || 0,
    lowStockThreshold: initialData?.inventory?.lowStockThreshold || 5,
  });

  const [images, setImages] = useState<ImageType[]>(initialData?.images || []);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadProgress(10); // Start progress
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
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
        setError("Failed to upload image locally: " + error.message);
      }
    }

    setImages(newImages);
    setUploadProgress(null);
    // Reset file input
    e.target.value = '';
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

    try {
      if (!formData.name || !formData.slug || !formData.categoryId || formData.price <= 0) {
        throw new Error("Please fill in all required fields (Name, Slug, Category, Price > 0)");
      }
      if (images.length === 0) {
        throw new Error("Please upload at least one image.");
      }

      const selectedCategory = categories.find(c => c.id === formData.categoryId);

      const productPayload = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        material: formData.material,
        dimensions: formData.dimensions,
        weight: formData.weight,
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name || "",
        categorySlug: selectedCategory?.slug || "",
        inventory: {
          currentStock: Number(formData.currentStock),
          lowStockThreshold: Number(formData.lowStockThreshold)
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

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 font-body-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow space-y-6">
            <h2 className="font-headline-sm text-primary border-b border-outline-variant/30 pb-4">Basic Information</h2>
            
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Product Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2 flex justify-between">
                  <span>Slug *</span>
                  <button type="button" onClick={handleSlugify} className="text-primary hover:underline lowercase normal-case">Generate</button>
                </label>
                <input required type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md resize-y" />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow space-y-6">
            <h2 className="font-headline-sm text-primary border-b border-outline-variant/30 pb-4">Images</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/30 group">
                  <Image src={img.url} alt={`Upload ${idx}`} fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <X className="w-4 h-4" />
                  </button>
                  {img.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              
              <label className="relative aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-low flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadProgress !== null} className="hidden" />
                {uploadProgress !== null ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <span className="text-sm text-on-surface-variant">{Math.round(uploadProgress)}%</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-on-surface-variant group-hover:text-primary mb-2 transition-colors" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Upload Images</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Settings */}
        <div className="space-y-8">
          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow space-y-6">
            <h2 className="font-headline-sm text-primary border-b border-outline-variant/30 pb-4">Organization</h2>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Category *</label>
              <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md">
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md">
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow space-y-6">
            <h2 className="font-headline-sm text-primary border-b border-outline-variant/30 pb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Price (₹) *</label>
                <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Discount (₹)</label>
                <input type="number" min="0" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Stock</label>
                <input required type="number" min="0" name="currentStock" value={formData.currentStock} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Low Stock Alert</label>
                <input required type="number" min="0" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 soft-shadow space-y-6">
            <h2 className="font-headline-sm text-primary border-b border-outline-variant/30 pb-4">Flags</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">Best Seller</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleInputChange} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">New Arrival</span>
              </label>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-8">
        <button type="button" onClick={() => router.back()} className="px-8 py-3 btn-radius font-headline-sm text-primary border border-outline-variant hover:bg-surface-container-low transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isLoading || uploadProgress !== null} className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isEditing ? "Update Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
