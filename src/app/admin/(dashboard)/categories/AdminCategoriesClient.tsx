"use client";

import { useState, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Save, X, Loader2, Image as ImageIcon } from "lucide-react";
import { db, storage } from "@/lib/firebase/client";
import { collection, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: boolean;
  displayOrder: number;
  imageUrl?: string;
};

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter(c => c.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
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
      setTimeout(() => setUploadProgress(0), 500); // Clear progress after a brief moment
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        displayOrder: Number(formData.displayOrder),
        imageUrl: formData.imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingCategory) {
        await setDoc(doc(db, "categories", editingCategory.id), payload, { merge: true });
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
      } else {
        const docRef = await addDoc(collection(db, "categories"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        setCategories([...categories, { id: docRef.id, ...payload }]);
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary font-body-md"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 btn-radius font-headline-sm hover:bg-tertiary transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
                <th className="p-4 font-label-caps text-on-surface-variant w-16">Image</th>
                <th className="p-4 font-label-caps text-on-surface-variant">Order</th>
                <th className="p-4 font-label-caps text-on-surface-variant">Name</th>
                <th className="p-4 font-label-caps text-on-surface-variant">Slug</th>
                <th className="p-4 font-label-caps text-on-surface-variant">Status</th>
                <th className="p-4 font-label-caps text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/20 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center relative">
                      {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-on-surface-variant/50" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-body-md">
                    {category.displayOrder}
                  </td>
                  <td className="p-4">
                    <div className="font-headline-sm text-primary">{category.name}</div>
                    <div className="text-xs text-on-surface-variant line-clamp-1">{category.description}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-body-md text-sm bg-surface-container/30">
                    /{category.slug}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      category.status ? 'bg-[#c3e8ca] text-[#0f5223]' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {category.status ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={isDeleting === category.id}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-md">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in-up">
          <div className="bg-surface w-full max-w-lg rounded-3xl soft-shadow overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h2 className="font-headline-md text-primary">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Category Image */}
                <div className="flex flex-col items-center mb-4">
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high border-2 border-dashed border-outline-variant hover:border-primary flex items-center justify-center relative cursor-pointer group transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.imageUrl ? (
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant mt-2">Upload Category Image</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Category Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
                </div>
                
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2 flex justify-between">
                    <span>Slug *</span>
                    <button type="button" onClick={handleSlugify} className="text-primary hover:underline lowercase normal-case">Generate</button>
                  </label>
                  <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
                </div>

                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-2">Display Order</label>
                    <input type="number" min="0" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md" />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-2">Status</label>
                    <select value={formData.status ? "true" : "false"} onChange={(e) => setFormData({...formData, status: e.target.value === "true"})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-body-md">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-outline-variant/30 flex justify-end gap-4 bg-surface-container-lowest">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 btn-radius font-headline-sm text-primary border border-outline-variant hover:bg-surface-container-low transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || (uploadProgress > 0 && uploadProgress < 100)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingCategory ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
