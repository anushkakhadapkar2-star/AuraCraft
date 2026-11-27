"use client";

import { useState, useRef, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Save, X, Loader2, Image as ImageIcon, Sparkles, AlertCircle, Check, ArrowUpDown } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: boolean;
  displayOrder: number;
  imageUrl?: string;
};

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: true,
    displayOrder: 0,
    imageUrl: ""
  });

  const router = useRouter();

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
  }, [categories, search]);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(prev => prev.filter(c => c.id !== id));
      showFeedback("success", `Category "${name}" deleted.`);
      setCategoryToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete category:", err);
      showFeedback("error", "Failed to delete category.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        status: category.status,
        displayOrder: category.displayOrder || 0,
        imageUrl: category.imageUrl || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: true,
        displayOrder: categories.length + 1,
        imageUrl: ""
      });
    }
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleSlugify = () => {
    setFormData(prev => ({
      ...prev,
      slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(10);

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

      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      showFeedback("success", "Category image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image:", error);
      showFeedback("error", "Failed to upload image.");
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      showFeedback("error", "Name and slug are required.");
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        status: formData.status,
        displayOrder: Number(formData.displayOrder) || 0,
        imageUrl: formData.imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingCategory) {
        await setDoc(doc(db, "categories", editingCategory.id), payload, { merge: true });
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
        showFeedback("success", `Category "${payload.name}" updated.`);
      } else {
        const docRef = await addDoc(collection(db, "categories"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        setCategories(prev => [...prev, { id: docRef.id, ...payload }]);
        showFeedback("success", `Category "${payload.name}" created.`);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      showFeedback("error", "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Categories & Collections
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29]"></span>
              {categories.filter(c => c.status).length} Active
            </span>
          </div>
          <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
            Organize handmade crochet, bespoke hampers, festive torans, and artisan jewellery.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => handleOpenModal()}
            className="btn-press btn-shimmer w-full md:w-auto flex items-center justify-center gap-2 bg-[#563A29] text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-[#3d2719] transition-all shadow-xs cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-[#CDAE91]" />
            <span>Add Collection</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Collections</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{categories.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">Catalog sections</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Active in Store</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{categories.filter(c => c.status).length}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Visible to shoppers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Hidden / Draft</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{categories.filter(c => !c.status).length}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Unpublished</div>
          </div>
          <div className="bg-gradient-to-br from-[#563A29] to-[#3d2719] text-white rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E9DCCB]/80">Sort Hierarchy</div>
            <div className="text-xl font-bold font-serif mt-1">Order Index</div>
            <div className="text-[11px] text-[#CDAE91] mt-0.5 font-medium">Auto-sorted by priority</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E9DCCB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#563A29]/50" />
            <input
              type="text"
              placeholder="Search collections by name or slug..."
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
            Showing <strong className="text-[#563A29]">{filteredCategories.length}</strong> of {categories.length} categories
          </div>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white rounded-3xl border border-[#E9DCCB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E9DCCB] text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70">
                  <th className="py-3.5 px-4 w-16 text-center">Visual</th>
                  <th className="py-3.5 px-4 w-20 text-center">Order</th>
                  <th className="py-3.5 px-4">Collection Name & Description</th>
                  <th className="py-3.5 px-4">URL Slug</th>
                  <th className="py-3.5 px-4">Store Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DCCB]/60 text-xs">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E9DCCB] flex items-center justify-center relative mx-auto shadow-2xs">
                        {category.imageUrl ? (
                          <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#CDAE91]" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#563A29]">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F8F4EE] border border-[#E9DCCB]">
                        #{category.displayOrder}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-sm text-[#563A29]">{category.name}</div>
                      <div className="text-[11px] text-[#563A29]/65 line-clamp-1 mt-0.5">
                        {category.description || "No description provided."}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-[11px] bg-[#FAF7F2] text-[#563A29] px-2 py-0.5 rounded border border-[#E9DCCB] font-mono">
                        /{category.slug}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${category.status
                          ? 'bg-[#c3e8ca] text-[#0f5223] border border-[#86efac]'
                          : 'bg-[#F8F4EE] text-[#563A29]/60 border border-[#E9DCCB]'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${category.status ? 'bg-[#0f5223]' : 'bg-[#563A29]/40'}`} />
                        {category.status ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="btn-press min-h-[38px] min-w-[38px] p-2 text-[#563A29] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E9DCCB] rounded-xl transition-all inline-flex items-center justify-center cursor-pointer"
                          title="Edit Collection"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(category)}
                          className="btn-press min-h-[38px] min-w-[38px] p-2 text-[#ba1a1a] hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#563A29]/60">
                      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#CDAE91] flex items-center justify-center mx-auto mb-2 border border-[#E9DCCB]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-sm text-[#563A29]">No collections found</p>
                      <p className="text-xs text-[#563A29]/60 mt-0.5">Try searching with another keyword or click &quot;Add Collection&quot; above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E9DCCB] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Delete Collection?</h3>
                <p className="text-xs text-[#563A29]/70">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#563A29]/80 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#E9DCCB]">
              Are you sure you want to delete <strong className="text-[#563A29]">&quot;{categoryToDelete.name}&quot;</strong>? Any products currently tagged under this category may become unassigned.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-[#FAF7F2] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting === categoryToDelete.id}
                className="btn-press px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 min-h-[44px] inline-flex items-center gap-1.5"
              >
                {isDeleting === categoryToDelete.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Collection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E9DCCB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="p-5 border-b border-[#E9DCCB] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CDAE91]" />
                <h2 className="font-serif font-bold text-lg text-[#563A29]">
                  {editingCategory ? "Edit Collection" : "Add New Collection"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-press p-2 text-[#563A29]/60 hover:text-[#563A29] hover:bg-white rounded-full transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                {/* Category Image */}
                <div className="flex flex-col items-center pb-2">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FAF7F2] border-2 border-dashed border-[#CDAE91] hover:border-[#563A29] flex items-center justify-center relative cursor-pointer group transition-colors shadow-2xs"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload visual preview"
                  >
                    {formData.imageUrl ? (
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-7 h-7 text-[#CDAE91] mx-auto mb-1 group-hover:text-[#563A29] transition-colors" />
                        <span className="text-[10px] text-[#563A29]/70 font-semibold block">Click to Upload</span>
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#563A29]/60 mt-2 font-medium">Recommended: Square PNG/WebP (600x600px)</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={handleSlugify}
                    placeholder="e.g. Everlasting Crochet Blooms"
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={handleSlugify}
                      className="text-[11px] text-[#CDAE91] hover:text-[#563A29] font-bold underline"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#563A29]/50">/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="crochet-blooms"
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl pl-7 pr-4 py-2.5 text-xs font-mono font-semibold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe what crafts and gifts are included in this collection..."
                    className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl p-3 text-xs font-medium text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all"
                  />
                </div>

                {/* Display Order & Status */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                      Display Order Priority
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#563A29]/70 mb-1.5">
                      Store Visibility
                    </label>
                    <select
                      value={formData.status ? "true" : "false"}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === "true" }))}
                      className="w-full bg-[#FAF7F2] border border-[#E9DCCB] rounded-xl px-3 py-2.5 text-xs font-bold text-[#563A29] focus:outline-none focus:border-[#563A29] focus:bg-white transition-all min-h-[44px] cursor-pointer"
                    >
                      <option value="true">Active (Visible)</option>
                      <option value="false">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E9DCCB] bg-[#FAF7F2] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-white min-h-[44px]"
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#CDAE91]" />
                      <span>{editingCategory ? "Save Changes" : "Create Collection"}</span>
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
