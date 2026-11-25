"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { useCartStore } from "@/store/useCartStore";
import { getInitials } from "@/lib/utils";
import {
  Package,
  User,
  MapPin,
  Heart,
  HelpCircle,
  LogOut,
  Camera,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  ShoppingBag,
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  Building,
  Home,
  Search,
  Printer,
  CreditCard,
  Ticket,
  Star,
  Bell,
  RotateCcw,
  FileText,
  Copy,
  Sparkles,
} from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

interface PaymentMethod {
  id: string;
  type: "UPI" | "CARD";
  title: string;
  detail: string;
  isDefault?: boolean;
}

interface ProfileClientProps {
  initialUser: any;
  initialOrders: any[];
  initialReviews?: any[];
  wishlistProducts: any[];
}

const FAQS = [
  {
    q: "How long does shipping take for handcrafted crochet pieces?",
    a: "Every Aura Craft piece is meticulously handmade. Ready-to-ship pieces dispatch within 2 business days; custom items take 3-4 days. Doorstep delivery across India typically takes 4-6 business days with live tracking.",
  },
  {
    q: "How do I care for and clean my crochet flowers and home decor?",
    a: "Gently dust your crochet creations using a soft, dry brush or a cool hairdryer setting. For small spots, use a damp cloth with mild soap. Avoid soaking or machine washing to preserve thread tension and shape.",
  },
  {
    q: "Can I request custom yarn colors or gift packaging?",
    a: "Yes! We specialize in custom floral arrangements, torans, and festive hampers. Simply message our artisan team directly on WhatsApp (+91 9324488603) with your preference before or right after placing your order.",
  },
  {
    q: "What is your return or replacement policy?",
    a: "Because each piece is crafted by hand, we only accept replacements if an item arrives damaged in transit. Please contact us via WhatsApp or email with an unboxing photo within 48 hours of delivery for a replacement.",
  },
];

const STORE_COUPONS = [
  {
    code: "AURA10",
    discount: "10% FLAT OFF",
    title: "Handcrafted Welcome Offer",
    desc: "Valid on all crochet bouquets, flowers, and torans on orders above ₹999.",
    minOrder: "₹999",
    expiry: "Valid till 31 Dec 2026",
  },
  {
    code: "FESTIVE500",
    discount: "FLAT ₹500 OFF",
    title: "Festive Home Decor Special",
    desc: "Save ₹500 on handcrafted door torans, wall hangings & festive gift hampers.",
    minOrder: "₹2,499",
    expiry: "Valid till 15 Dec 2026",
  },
  {
    code: "FREESHIP",
    discount: "FREE EXPRESS DELIVERY",
    title: "Zero Shipping Across India",
    desc: "Enjoy free standard courier delivery on any handmade creation across India.",
    minOrder: "₹499",
    expiry: "No Expiry",
  },
];

export function ProfileClient({
  initialUser,
  initialOrders,
  initialReviews = [],
  wishlistProducts,
}: ProfileClientProps) {
  // Navigation tabs (Amazon / Myntra inspired)
  const [activeTab, setActiveTab] = useState<
    "orders" | "buyAgain" | "profile" | "wishlist" | "reviews" | "payments" | "coupons" | "notifications" | "help"
  >("orders");

  // Orders Search & Filter state
  const [orderFilter, setOrderFilter] = useState<"ALL" | "ACTIVE" | "DELIVERED">("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderYearFilter, setOrderYearFilter] = useState("ALL");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // User details state
  const [user, setUser] = useState(initialUser || {});
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [alternatePhone, setAlternatePhone] = useState(initialUser?.alternatePhone || "");
  const [birthday, setBirthday] = useState(initialUser?.birthday || "");
  const [gender, setGender] = useState(initialUser?.gender || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser?.avatarUrl || "");

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: initialUser?.preferences?.emailUpdates ?? true,
    smsOrderUpdates: initialUser?.preferences?.smsOrderUpdates ?? true,
    festiveOffers: initialUser?.preferences?.festiveOffers ?? true,
  });

  // Saved Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    initialUser?.paymentMethods || [
      {
        id: "pm_upi_1",
        type: "UPI",
        title: "Google Pay / UPI",
        detail: initialUser?.phone ? `${initialUser.phone}@okaxis` : "customer@okaxis",
        isDefault: true,
      },
    ]
  );
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<"UPI" | "CARD">("UPI");
  const [newPaymentValue, setNewPaymentValue] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<Address[]>(initialUser?.addresses || []);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id">>({
    fullName: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME",
    isDefault: false,
  });

  // Gift Card redemption state
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState(0);

  // UI helpers
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addItem } = useCartStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Avatar upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newUrl = data.url;

      setAvatarUrl(newUrl);
      setUser((prev: any) => ({ ...prev, avatarUrl: newUrl }));

      await updateDoc(doc(db, "users", user.id), {
        avatarUrl: newUrl,
        updatedAt: new Date().toISOString(),
      });

      showToast("Profile photo updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save personal details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        alternatePhone: alternatePhone.trim(),
        birthday: birthday || null,
        gender: gender || null,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "users", user.id), payload);
      setUser((prev: any) => ({ ...prev, ...payload }));
      showToast("Personal details saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Notification Preferences
  const handleToggleNotification = async (key: "emailUpdates" | "smsOrderUpdates" | "festiveOffers") => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await updateDoc(doc(db, "users", user.id), {
        preferences: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast("Preference updated");
    } catch (e) {
      console.error(e);
    }
  };

  // Address operations
  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: name || "",
      phone: user.phone || "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
      type: "HOME",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      apartment: addr.apartment || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Address[] = [...addresses];

    if (editingAddressId) {
      updated = updated.map((a) => {
        if (a.id === editingAddressId) {
          return { ...a, ...addressForm };
        }
        return addressForm.isDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      const newAddr: Address = {
        id: "addr_" + Date.now(),
        ...addressForm,
      };
      if (addressForm.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(newAddr);
    }

    try {
      await updateDoc(doc(db, "users", user.id), {
        addresses: updated,
        updatedAt: new Date().toISOString(),
      });
      setAddresses(updated);
      setIsAddressModalOpen(false);
      showToast(editingAddressId ? "Address updated" : "Address saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Remove this address from your account?")) return;
    const filtered = addresses.filter((a) => a.id !== id);
    try {
      await updateDoc(doc(db, "users", user.id), {
        addresses: filtered,
        updatedAt: new Date().toISOString(),
      });
      setAddresses(filtered);
      showToast("Address removed");
    } catch (err) {
      console.error(err);
      alert("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    try {
      await updateDoc(doc(db, "users", user.id), {
        addresses: updated,
        updatedAt: new Date().toISOString(),
      });
      setAddresses(updated);
      showToast("Primary address updated");
    } catch (err) {
      console.error(err);
    }
  };

  // Payment method handlers
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentValue.trim()) return;

    const newMethod: PaymentMethod = {
      id: "pm_" + Date.now(),
      type: newPaymentType,
      title: newPaymentType === "UPI" ? "UPI ID" : "Saved Card",
      detail: newPaymentType === "UPI" ? newPaymentValue : `•••• •••• •••• ${newPaymentValue.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
    };

    const updated = [...paymentMethods, newMethod];
    try {
      await updateDoc(doc(db, "users", user.id), {
        paymentMethods: updated,
        updatedAt: new Date().toISOString(),
      });
      setPaymentMethods(updated);
      setIsAddPaymentModalOpen(false);
      setNewPaymentValue("");
      showToast("Payment method added");
    } catch (e) {
      console.error(e);
      alert("Failed to save payment method.");
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    const filtered = paymentMethods.filter((p) => p.id !== id);
    try {
      await updateDoc(doc(db, "users", user.id), {
        paymentMethods: filtered,
        updatedAt: new Date().toISOString(),
      });
      setPaymentMethods(filtered);
      showToast("Payment method removed");
    } catch (e) {
      console.error(e);
    }
  };

  // Gift Card Redeem
  const handleRedeemGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    if (giftCardCode.toUpperCase() === "AURA500" || giftCardCode.length >= 8) {
      setGiftCardBalance((prev) => prev + 500);
      showToast("₹500 Gift Voucher successfully added to your wallet balance!");
      setGiftCardCode("");
    } else {
      alert("Invalid or expired gift voucher code. Please check and try again.");
    }
  };

  // Buy Again products extracted from past orders (Amazon hallmark)
  const buyAgainProducts = useMemo(() => {
    const itemsMap = new Map();
    for (const order of initialOrders) {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const key = item.productId || item.product?.id || item.product?.slug || item.name;
          if (key && !itemsMap.has(key)) {
            itemsMap.set(key, {
              id: key,
              name: item.product?.name || item.name || "Handmade Product",
              price: item.price || item.product?.price || 999,
              discountPrice: item.product?.discountPrice,
              image: item.product?.image || item.product?.images?.[0]?.url || item.product?.images?.[0] || "",
              slug: item.product?.slug || "",
              category: item.product?.category || "Crochet Craft",
              lastOrdered: order.createdAt,
            });
          }
        }
      }
    }
    return Array.from(itemsMap.values());
  }, [initialOrders]);

  // Filtered orders with search & year filtering (Amazon hallmark)
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (orderFilter === "ACTIVE") {
        if (!["PROCESSING", "PENDING", "SHIPPED", "CONFIRMED"].includes(order.orderStatus || "PROCESSING")) {
          return false;
        }
      }
      if (orderFilter === "DELIVERED" && order.orderStatus !== "DELIVERED") {
        return false;
      }

      // Year filter
      if (orderYearFilter !== "ALL") {
        const orderYear = new Date(order.createdAt).getFullYear().toString();
        if (orderYear !== orderYearFilter) return false;
      }

      // Search Query filter
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesProduct = order.items?.some((i: any) =>
          (i.product?.name || i.name || "").toLowerCase().includes(q)
        );
        if (!matchesId && !matchesProduct) return false;
      }

      return true;
    });
  }, [initialOrders, orderFilter, orderYearFilter, orderSearchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#3d2617] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-[#e0a96d]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e2dc] pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#82746d] mb-1">
            <Link href="/" className="hover:text-[#553722] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#553722] font-medium">My Account</span>
          </nav>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2d1b11]">
            My Account
          </h1>
        </div>

        <div className="text-xs text-[#82746d] flex items-center gap-2">
          <span>Signed in as</span>
          <span className="font-semibold text-[#2d1b11]">{user.name || user.email || user.phone}</span>
        </div>
      </div>

      {/* Main 2-Column Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* SIDEBAR NAVIGATION (AMAZON & MYNTRA STYLE)               */}
        {/* ========================================================= */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Customer Profile Snippet */}
          <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="relative group shrink-0">
                <div className="w-13 h-13 rounded-full overflow-hidden bg-[#f5ede3] border border-[#d8cec5] text-[#553722] flex items-center justify-center font-serif text-lg font-semibold shadow-xs">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.name || "Customer"}
                      width={52}
                      height={52}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="tracking-tight text-base font-bold font-sans">{getInitials(user.name, user.email)}</span>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-white text-[#553722] hover:bg-[#553722] hover:text-white border border-[#d8cec5] shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  title="Change avatar photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[#2d1b11] text-sm truncate">
                  {user.name || "Aura Craft Customer"}
                </h3>
                <p className="text-xs text-[#82746d] truncate mt-0.5">
                  {user.phone || user.email}
                </p>
                {giftCardBalance > 0 && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Wallet: ₹{giftCardBalance}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grouped Menu List */}
          <nav className="bg-white rounded-2xl border border-[#e8e2dc] p-2 shadow-xs space-y-1">
            {/* Orders Group */}
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#82746d]">
              Orders & Purchases
            </div>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 shrink-0" />
                <span>My Orders</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "orders" ? "bg-white/20 text-white" : "bg-[#f5ede3] text-[#553722]"
                }`}
              >
                {initialOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("buyAgain")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "buyAgain"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Buy Again</span>
              </div>
              {buyAgainProducts.length > 0 && (
                <span className="text-[11px] text-[#82746d] font-semibold">
                  {buyAgainProducts.length} items
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "wishlist"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 shrink-0 text-rose-500" />
                <span>Wishlist</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "wishlist" ? "bg-white/20 text-white" : "bg-[#f5ede3] text-[#553722]"
                }`}
              >
                {wishlistProducts.length}
              </span>
            </button>

            {/* Account Settings Group */}
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#82746d] border-t border-[#f0eded] mt-2">
              Profile & Preferences
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 shrink-0" />
                <span>Personal & Addresses</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === "profile" ? "text-white" : ""}`} />
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "payments"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Payment Methods</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === "payments" ? "text-white" : ""}`} />
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "coupons"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Coupons & Gift Cards</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                {STORE_COUPONS.length} active
              </span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 shrink-0 text-amber-500" />
                <span>My Product Reviews</span>
              </div>
              <span className="text-xs text-[#82746d] font-semibold">{initialReviews.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications & Alerts</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === "notifications" ? "text-white" : ""}`} />
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "help"
                  ? "bg-[#553722] text-white shadow-xs"
                  : "text-[#50453e] hover:bg-[#f8f5f1] hover:text-[#2d1b11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Customer Care & FAQs</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === "help" ? "text-white" : ""}`} />
            </button>

            <div className="pt-2 border-t border-[#f0eded]">
              <Link
                href="/api/auth/signout"
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </Link>
            </div>
          </nav>

          {/* WhatsApp Direct Help */}
          <div className="bg-[#fbf9f8] border border-[#e8e2dc] rounded-2xl p-4 text-xs text-[#6b584d] space-y-1.5">
            <p className="font-semibold text-[#2d1b11]">Artisan Customer Care</p>
            <p className="text-[11px] leading-relaxed">Mon–Sat, 10 AM to 7 PM IST</p>
            <a
              href="https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20have%20an%20order%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#553722] font-semibold hover:underline pt-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp +91 9324488603</span>
            </a>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA                                         */}
        {/* ========================================================= */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* ======================================================= */}
          {/* TAB 1: ORDERS & TRACKING WITH SEARCH, YEAR & INVOICE    */}
          {/* ======================================================= */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#e8e2dc] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">My Orders</h2>
                    <p className="text-xs text-[#82746d] mt-0.5">
                      Track deliveries, download official GST tax invoices, and reorder past creations.
                    </p>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-[#f6f3f2] p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
                    <button
                      onClick={() => setOrderFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        orderFilter === "ALL"
                          ? "bg-white text-[#2d1b11] shadow-2xs font-semibold"
                          : "text-[#82746d] hover:text-[#2d1b11]"
                      }`}
                    >
                      All ({initialOrders.length})
                    </button>
                    <button
                      onClick={() => setOrderFilter("ACTIVE")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        orderFilter === "ACTIVE"
                          ? "bg-white text-[#2d1b11] shadow-2xs font-semibold"
                          : "text-[#82746d] hover:text-[#2d1b11]"
                      }`}
                    >
                      In Transit
                    </button>
                    <button
                      onClick={() => setOrderFilter("DELIVERED")}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        orderFilter === "DELIVERED"
                          ? "bg-white text-[#2d1b11] shadow-2xs font-semibold"
                          : "text-[#82746d] hover:text-[#2d1b11]"
                      }`}
                    >
                      Delivered
                    </button>
                  </div>
                </div>

                {/* Amazon-Style Order Search & Timeframe Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#82746d] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by product name or order ID..."
                      className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#82746d] hover:text-[#2d1b11]"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={orderYearFilter}
                    onChange={(e) => setOrderYearFilter(e.target.value)}
                    className="bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                  >
                    <option value="ALL">All Orders</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#f6f3f2] text-[#82746d] flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2d1b11]">No matching orders</h3>
                  <p className="text-xs text-[#82746d] max-w-sm mx-auto">
                    {orderSearchQuery
                      ? `No orders matched "${orderSearchQuery}". Check for typos or clear your search.`
                      : "You haven't placed any orders matching this filter."}
                  </p>
                  {orderSearchQuery ? (
                    <button
                      onClick={() => {
                        setOrderSearchQuery("");
                        setOrderFilter("ALL");
                        setOrderYearFilter("ALL");
                      }}
                      className="text-xs font-semibold text-[#553722] hover:underline"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      href="/shop"
                      className="inline-block mt-2 bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Browse Collections
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#e8e2dc]">
                  {filteredOrders.map((order) => {
                    const isDelivered = order.orderStatus === "DELIVERED";
                    const isCancelled = order.orderStatus === "CANCELLED";

                    return (
                      <div key={order.id} className="p-6 space-y-4 hover:bg-[#fbf9f8]/40 transition-colors">
                        {/* Order Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#2d1b11] tracking-wide">
                                ORDER #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                                  isDelivered
                                    ? "bg-[#f0f7f2] text-[#1b6133] border-[#d1ebd7]"
                                    : isCancelled
                                    ? "bg-[#fff2f2] text-[#b3261e] border-[#ffd6d6]"
                                    : "bg-[#fef8ee] text-[#8c5819] border-[#fae5c3]"
                                }`}
                              >
                                {order.orderStatus ? order.orderStatus.replace(/_/g, " ") : "PROCESSING"}
                              </span>
                            </div>
                            <p className="text-[#82746d] mt-0.5">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          {/* Quick Invoice Button (Amazon/Myntra Hallmark) */}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d8cec5] bg-white hover:bg-[#f5ede3]/40 text-xs font-medium text-[#2d1b11] transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#553722]" />
                            <span>Invoice</span>
                          </button>
                        </div>

                        {/* Order Products */}
                        <div className="space-y-3 pt-1">
                          {Array.isArray(order.items) &&
                            order.items.map((item: any, idx: number) => {
                              const img =
                                item.product?.image ||
                                item.product?.images?.[0]?.url ||
                                item.product?.images?.[0] ||
                                "";
                              const prodName = item.product?.name || item.name || "Handcrafted Creation";
                              const prodSlug = item.product?.slug;

                              return (
                                <div key={idx} className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-xl bg-[#f5ede3] border border-[#e8e2dc] overflow-hidden shrink-0 relative">
                                    {img ? (
                                      <Image
                                        src={img}
                                        alt={prodName}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[#82746d]">
                                        <Package className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {prodSlug ? (
                                      <Link
                                        href={`/product/${prodSlug}`}
                                        className="text-sm font-medium text-[#2d1b11] hover:text-[#553722] hover:underline truncate block"
                                      >
                                        {prodName}
                                      </Link>
                                    ) : (
                                      <p className="text-sm font-medium text-[#2d1b11] truncate">{prodName}</p>
                                    )}
                                    <p className="text-xs text-[#82746d] mt-0.5">
                                      Qty: {item.quantity || 1} • Handcrafted with love
                                    </p>
                                    <p className="text-xs font-semibold text-[#2d1b11] mt-1">
                                      ₹{(item.price || 0).toLocaleString("en-IN")}
                                    </p>
                                  </div>

                                  {/* Quick Buy Again & Review Buttons */}
                                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addItem(
                                          item.product || {
                                            id: item.productId,
                                            name: prodName,
                                            price: item.price,
                                            image: img,
                                            slug: prodSlug || "",
                                          },
                                          1
                                        );
                                        showToast(`Added ${prodName} to cart`);
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#553722] bg-[#f5ede3]/70 hover:bg-[#f5ede3] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Buy Again</span>
                                    </button>

                                    {prodSlug && isDelivered && (
                                      <Link
                                        href={`/product/${prodSlug}#reviews`}
                                        className="text-xs text-[#82746d] hover:text-[#2d1b11] underline px-2 py-1"
                                      >
                                        Rate Item
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* Order Footer & Action Row */}
                        <div className="pt-3 border-t border-[#f0eded] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="text-[#82746d]">
                            <span>Total Paid: </span>
                            <span className="font-serif font-bold text-sm text-[#2d1b11]">
                              ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                            {order.paymentMethod && (
                              <span className="ml-2 text-[11px] text-[#82746d]">
                                via {order.paymentMethod.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/track-order/${order.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#553722] text-white hover:bg-[#3d2617] font-semibold text-xs transition-colors"
                            >
                              <span>Track Package</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: BUY AGAIN (AMAZON HALLMARK FEATURE)              */}
          {/* ======================================================= */}
          {activeTab === "buyAgain" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-6">
              <div className="border-b border-[#e8e2dc] pb-4">
                <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Buy Again</h2>
                <p className="text-xs text-[#82746d] mt-0.5">
                  Frequently reordered handmade favorites from your purchase history.
                </p>
              </div>

              {buyAgainProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#fbf9f8] text-[#82746d] flex items-center justify-center mx-auto border border-[#e8e2dc]">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2d1b11]">No previous purchases</h3>
                  <p className="text-xs text-[#82746d] max-w-sm mx-auto">
                    Items you purchase will appear here for fast 1-click reordering in the future.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-2 bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {buyAgainProducts.map((p) => (
                    <div
                      key={p.id}
                      className="border border-[#e8e2dc] rounded-xl overflow-hidden hover:border-[#d8cec5] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-square bg-[#f5ede3] overflow-hidden">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#82746d]">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="p-3.5">
                          <span className="text-[10px] text-[#82746d] uppercase tracking-wider font-semibold">
                            {p.category}
                          </span>
                          <Link
                            href={`/product/${p.slug}`}
                            className="font-medium text-xs sm:text-sm text-[#2d1b11] hover:text-[#553722] truncate block mt-0.5"
                          >
                            {p.name}
                          </Link>
                          <p className="font-serif font-bold text-sm text-[#2d1b11] mt-1">
                            ₹{(p.discountPrice || p.price).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-[#82746d] mt-1">
                            Ordered: {new Date(p.lastOrdered).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            addItem(p, 1);
                            showToast(`Added ${p.name} to cart`);
                          }}
                          className="w-full bg-[#553722] hover:bg-[#3d2617] text-white py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: PERSONAL DETAILS & ADDRESSES (INTEGRATED)       */}
          {/* ======================================================= */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs divide-y divide-[#e8e2dc]">
              {/* Form 1: Personal Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">
                    Personal Information
                  </h2>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    Update your identity, contact information, and delivery backup.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Verified Phone Banner */}
                  <div className="p-4 bg-[#fbf9f8] border border-[#e8e2dc] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-[#82746d] uppercase tracking-wider block">
                        Registered Mobile Number
                      </span>
                      <p className="font-semibold text-sm text-[#2d1b11] mt-0.5">
                        {user.phone || "Not linked"}
                      </p>
                      <p className="text-[11px] text-[#82746d] mt-0.5">Used for secure OTP sign-in.</p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b6133] bg-[#f0f7f2] border border-[#d1ebd7] px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>OTP Verified</span>
                    </span>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2d1b11] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Anushka Sharma"
                        className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3.5 py-2.5 text-sm text-[#2d1b11] focus:outline-none focus:border-[#553722] focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2d1b11] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. anushka@example.com"
                        className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3.5 py-2.5 text-sm text-[#2d1b11] focus:outline-none focus:border-[#553722] focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2d1b11] mb-1.5">
                        Alternate Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3.5 py-2.5 text-sm text-[#2d1b11] focus:outline-none focus:border-[#553722] focus:bg-white transition-colors"
                      />
                      <span className="text-[10px] text-[#82746d] mt-1 block">
                        Used as a secondary contact for courier delivery.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2d1b11] mb-1.5">
                        Birthday (Optional)
                      </label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3.5 py-2.5 text-sm text-[#2d1b11] focus:outline-none focus:border-[#553722] focus:bg-white transition-colors"
                      />
                      <span className="text-[10px] text-[#82746d] mt-1 block">
                        Receive a surprise handcrafted birthday voucher.
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#2d1b11] mb-1.5">
                        Gender (Optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Female", "Male", "Non-Binary", "Prefer not to say"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                              gender === g
                                ? "bg-[#553722] text-white border-[#553722]"
                                : "bg-[#fbf9f8] text-[#50453e] border-[#d8cec5] hover:border-[#553722]"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#553722] hover:bg-[#3d2617] text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Saved Delivery Addresses (Directly integrated below personal details) */}
              <div id="saved-addresses-section" className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#2d1b11]">
                      Delivery Addresses
                    </h3>
                    <p className="text-xs text-[#82746d] mt-0.5">
                      Save multiple home, work, or gifting addresses for 1-click checkout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openNewAddress}
                    className="inline-flex items-center gap-1.5 bg-[#553722] hover:bg-[#3d2617] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dotted Add New Card */}
                  <button
                    type="button"
                    onClick={openNewAddress}
                    className="min-h-[160px] rounded-xl border border-dashed border-[#d8cec5] hover:border-[#553722] bg-[#fbf9f8] hover:bg-[#f5ede3]/40 flex flex-col items-center justify-center p-5 text-center transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white text-[#553722] flex items-center justify-center border border-[#d8cec5] mb-2 group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-[#2d1b11]">Add New Address</span>
                    <span className="text-[11px] text-[#82746d] mt-0.5">Home, office, or gift address</span>
                  </button>

                  {/* Saved Cards */}
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-xl p-4 border flex flex-col justify-between transition-colors ${
                        addr.isDefault
                          ? "border-[#553722] shadow-2xs"
                          : "border-[#e8e2dc] hover:border-[#d8cec5]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-[#f6f3f2] text-[#553722] rounded-md">
                              {addr.type === "WORK" ? <Building className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                              <span>{addr.type}</span>
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-semibold text-[#1b6133] bg-[#f0f7f2] border border-[#d1ebd7] px-2 py-0.5 rounded-md">
                                Default Shipping
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditAddress(addr)}
                              className="p-1 text-[#82746d] hover:text-[#553722] transition-colors cursor-pointer"
                              title="Edit address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1 text-[#82746d] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-sm text-[#2d1b11]">{addr.fullName}</p>
                          <p className="text-xs text-[#50453e] mt-1 leading-relaxed">
                            {addr.street}
                            {addr.apartment ? `, ${addr.apartment}` : ""}
                            <br />
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="text-xs text-[#82746d] mt-2 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {addr.phone}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#f0eded] flex items-center justify-between text-xs">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[#553722] font-semibold hover:underline cursor-pointer"
                          >
                            Set as primary
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#1b6133] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Default delivery address
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditAddress(addr)}
                          className="text-[#82746d] hover:text-[#2d1b11] font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: SAVED PAYMENT METHODS (AMAZON PAY / MYNTRA STYLE)*/}
          {/* ======================================================= */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2dc] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Saved Payment Methods</h2>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    Manage your saved UPI accounts, credit/debit cards, and payment preferences.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#553722] hover:bg-[#3d2617] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Payment Method</span>
                </button>
              </div>

              {/* Payment Methods List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-4 rounded-xl border border-[#e8e2dc] bg-[#fbf9f8] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#d8cec5] flex items-center justify-center text-[#553722] shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-[#2d1b11]">{pm.title}</p>
                          {pm.isDefault && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#82746d] mt-0.5 font-mono">{pm.detail}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      className="p-1.5 text-[#82746d] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      title="Remove method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#f8f5f1] rounded-xl text-xs text-[#6b584d] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#553722] shrink-0" />
                <span>
                  All transactions on Aura Craft are encrypted with 256-bit bank-grade SSL security through Razorpay & RBI-compliant payment gateways.
                </span>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: COUPONS & GIFT CARDS                             */}
          {/* ======================================================= */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              {/* Redeem Gift Card / Craft Voucher (Amazon Pay Balance style) */}
              <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Aura Craft Gift Cards & Vouchers</h2>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    Have an artisan gift card or voucher code? Redeem it directly into your wallet balance.
                  </p>
                </div>

                <form onSubmit={handleRedeemGiftCard} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Enter 8 to 16 character gift card code (e.g. AURA500)"
                    className="flex-1 bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-4 py-2.5 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722] uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="bg-[#553722] hover:bg-[#3d2617] text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Add to Wallet
                  </button>
                </form>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0eded] text-xs">
                  <span className="text-[#82746d]">Available Aura Wallet Credit:</span>
                  <span className="font-serif font-bold text-base text-[#1b6133]">
                    ₹{giftCardBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Active Coupons List */}
              <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#2d1b11]">Active Promotional Coupons</h3>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    Copy and apply these voucher codes during checkout.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {STORE_COUPONS.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="p-4 rounded-xl border border-dashed border-[#d8cec5] bg-[#fbf9f8] space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#8a5b3a] bg-[#f5ede3] px-2 py-0.5 rounded-md">
                            {coupon.minOrder} Min Order
                          </span>
                          <span className="text-[10px] text-[#82746d]">{coupon.expiry}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#2d1b11] mt-2">
                          {coupon.discount}
                        </h4>
                        <p className="font-medium text-xs text-[#553722] mt-0.5">{coupon.title}</p>
                        <p className="text-xs text-[#6b584d] mt-1 leading-relaxed">{coupon.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-[#e8e2dc] flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#2d1b11] bg-white border border-[#d8cec5] px-2.5 py-1 rounded">
                          {coupon.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyCoupon(coupon.code)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#553722] hover:underline cursor-pointer"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 6: MY PRODUCT REVIEWS & RATINGS (AMAZON/MYNTRA)     */}
          {/* ======================================================= */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-6">
              <div className="border-b border-[#e8e2dc] pb-4">
                <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">My Product Reviews</h2>
                <p className="text-xs text-[#82746d] mt-0.5">
                  Reviews and photos you have shared with the Aura Craft artisan community.
                </p>
              </div>

              {initialReviews.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#fbf9f8] text-[#82746d] flex items-center justify-center mx-auto border border-[#e8e2dc]">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2d1b11]">No reviews published yet</h3>
                  <p className="text-xs text-[#82746d] max-w-sm mx-auto">
                    Help fellow craft lovers by sharing your thoughts and photos on delivered orders!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="inline-block mt-2 bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Delivered Orders
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl border border-[#e8e2dc] bg-[#fbf9f8] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-[#d8cec5]"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-[#2d1b11] ml-1.5">{rev.rating || 5}/5</span>
                        </div>

                        <span className="text-[11px] text-[#82746d]">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#2d1b11] leading-relaxed">
                        {rev.comment || "Loved the quality and delicate artisan craftsmanship!"}
                      </p>

                      {/* Verified Seller Response (Amazon / Myntra Hallmark) */}
                      {rev.adminReply?.message && (
                        <div className="p-3 bg-white rounded-lg border border-[#e8e2dc] text-xs text-[#553722] space-y-1">
                          <p className="font-semibold flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{rev.adminReply.author || "Aura Craft Team"} (Seller Response)</span>
                          </p>
                          <p className="text-[#6b584d]">{rev.adminReply.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 7: WISHLIST                                         */}
          {/* ======================================================= */}
          {activeTab === "wishlist" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#e8e2dc] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Saved Wishlist</h2>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    {wishlistProducts.length} pieces saved for later.
                  </p>
                </div>

                <Link href="/shop" className="text-xs font-semibold text-[#553722] hover:underline">
                  Explore Catalog →
                </Link>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#fbf9f8] text-[#82746d] flex items-center justify-center mx-auto border border-[#e8e2dc]">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2d1b11]">Your wishlist is empty</h3>
                  <p className="text-xs text-[#82746d] max-w-sm mx-auto">
                    Save your favorite crochet bouquets, mirrors, and door torans by clicking the heart icon on any product.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-2 bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Start Browsing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="border border-[#e8e2dc] rounded-xl overflow-hidden hover:border-[#d8cec5] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-square bg-[#f5ede3] overflow-hidden">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#82746d]">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="p-3.5">
                          <span className="text-[10px] text-[#82746d] uppercase tracking-wider font-semibold">
                            {p.category}
                          </span>
                          <Link
                            href={`/product/${p.slug}`}
                            className="font-medium text-xs sm:text-sm text-[#2d1b11] hover:text-[#553722] truncate block mt-0.5"
                          >
                            {p.name}
                          </Link>
                          <p className="font-serif font-bold text-sm text-[#2d1b11] mt-1">
                            ₹{(p.discountPrice || p.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            addItem(p, 1);
                            showToast(`Added ${p.name} to cart`);
                          }}
                          className="w-full bg-[#553722] hover:bg-[#3d2617] text-white py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 8: NOTIFICATION PREFERENCES (AMAZON/MYNTRA SETTINGS)*/}
          {/* ======================================================= */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-6">
              <div className="border-b border-[#e8e2dc] pb-4">
                <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Notification Preferences</h2>
                <p className="text-xs text-[#82746d] mt-0.5">
                  Control which communications you receive from Aura Craft.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#f0eded]">
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm text-[#2d1b11]">
                      SMS & WhatsApp Courier Tracking
                    </h4>
                    <p className="text-xs text-[#82746d] mt-0.5">
                      Receive real-time courier dispatch alerts and OTP delivery codes via SMS and WhatsApp.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.smsOrderUpdates}
                      onChange={() => handleToggleNotification("smsOrderUpdates")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#553722]"></div>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm text-[#2d1b11]">
                      Email Invoices & Order Confirmations
                    </h4>
                    <p className="text-xs text-[#82746d] mt-0.5">
                      Receive detailed tax invoices and order status updates to your registered email address.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailUpdates}
                      onChange={() => handleToggleNotification("emailUpdates")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#553722]"></div>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm text-[#2d1b11]">
                      Festive Drop & Artisan Stories Newsletter
                    </h4>
                    <p className="text-xs text-[#82746d] mt-0.5">
                      Be the first to know about Diwali, Rakhi, and seasonal handmade drops with exclusive discount codes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.festiveOffers}
                      onChange={() => handleToggleNotification("festiveOffers")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#553722]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 9: CUSTOMER CARE & FAQS                             */}
          {/* ======================================================= */}
          {activeTab === "help" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#2d1b11]">Customer Support</h2>
                  <p className="text-xs text-[#82746d] mt-0.5">
                    Connect directly with our artisan workshop for tracking updates, gift customization, or order queries.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <a
                    href="https://wa.me/919324488603?text=Hi%20Aura%20Craft%2C%20I%20have%20an%20order%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-[#d1ebd7] bg-[#f0f7f2]/50 hover:bg-[#f0f7f2] transition-colors flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#1b6133]">WhatsApp Support</h4>
                      <p className="text-xs text-[#4b7a59] mt-0.5">+91 9324488603 • Fast Response</p>
                    </div>
                  </a>

                  <a
                    href="mailto:contact@auracraft.com"
                    className="p-4 rounded-xl border border-[#e8e2dc] bg-[#fbf9f8] hover:bg-[#f5ede3]/40 transition-colors flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#553722] text-white flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#2d1b11]">Email Us</h4>
                      <p className="text-xs text-[#82746d] mt-0.5">contact@auracraft.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white rounded-2xl border border-[#e8e2dc] shadow-xs p-6 space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#2d1b11]">Frequently Asked Questions</h3>

                <div className="divide-y divide-[#f0eded]">
                  {FAQS.map((faq, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#2d1b11] hover:text-[#553722] transition-colors cursor-pointer py-1"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#82746d] transition-transform duration-200 shrink-0 ml-2 ${
                            openFaq === idx ? "rotate-180 text-[#553722]" : ""
                          }`}
                        />
                      </button>

                      {openFaq === idx && (
                        <p className="mt-2 text-xs text-[#6b584d] leading-relaxed animate-in fade-in duration-150">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* INVOICE MODAL (AMAZON & MYNTRA OFFICIAL TAX RECEIPT)      */}
      {/* ========================================================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#e8e2dc] space-y-6 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-150">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b border-[#e8e2dc] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#553722] tracking-tight">AURA CRAFT</h2>
                <p className="text-xs text-[#82746d] mt-0.5">Handcrafted Creations & Artisan Floral Decor</p>
                <p className="text-[11px] text-[#82746d]">GSTIN: 27AABCA1234F1Z8 • Mumbai, Maharashtra</p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#2d1b11] block">TAX INVOICE</span>
                <span className="text-xs text-[#82746d]">INV-{selectedInvoiceOrder.id.slice(-6).toUpperCase()}</span>
                <p className="text-[11px] text-[#82746d] mt-1">
                  Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN")}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="text-xs text-[#82746d] hover:text-[#2d1b11] print:hidden mt-2 underline"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Bill To & Ship To Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#82746d] uppercase">Billed & Shipped To:</span>
                <p className="font-semibold text-[#2d1b11]">
                  {selectedInvoiceOrder.shippingAddress?.fullName || user.name || "Customer"}
                </p>
                <p className="text-[#6b584d] leading-relaxed">
                  {selectedInvoiceOrder.shippingAddress?.street || "Doorstep Address"}
                  <br />
                  {selectedInvoiceOrder.shippingAddress?.city || "Mumbai"},{" "}
                  {selectedInvoiceOrder.shippingAddress?.state || "Maharashtra"} —{" "}
                  {selectedInvoiceOrder.shippingAddress?.pincode || "400001"}
                </p>
                <p className="text-[#82746d]">
                  Phone: {selectedInvoiceOrder.shippingAddress?.phone || user.phone}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-[#82746d] uppercase">Order Details:</span>
                <p className="font-mono text-xs text-[#2d1b11]">
                  Order ID: #{selectedInvoiceOrder.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-[#82746d]">
                  Payment: {selectedInvoiceOrder.paymentMethod?.replace(/_/g, " ") || "Prepaid"}
                </p>
                <p className="text-[#82746d]">Status: Confirmed / Paid</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-[#e8e2dc] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fbf9f8] border-b border-[#e8e2dc] text-[#6b584d] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eded]">
                  {selectedInvoiceOrder.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-medium text-[#2d1b11]">
                        {item.product?.name || item.name || "Handmade Product"}
                      </td>
                      <td className="py-2.5 px-3 text-center">{item.quantity || 1}</td>
                      <td className="py-2.5 px-3 text-right">₹{(item.price || 0).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#2d1b11]">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t border-[#e8e2dc] pt-2">
                <div className="flex justify-between text-[#82746d]">
                  <span>Subtotal:</span>
                  <span>₹{(selectedInvoiceOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#82746d]">
                  <span>Standard Shipping:</span>
                  <span className="text-[#1b6133] font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-[#82746d]">
                  <span>Estimated Taxes (Included):</span>
                  <span>₹{Math.round((selectedInvoiceOrder.totalAmount || 0) * 0.05).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-sm text-[#2d1b11] border-t border-[#e8e2dc] pt-1.5">
                  <span>Grand Total:</span>
                  <span>₹{(selectedInvoiceOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer Actions */}
            <div className="pt-3 border-t border-[#e8e2dc] flex items-center justify-between print:hidden">
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-xs text-[#82746d] hover:text-[#2d1b11] cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD PAYMENT METHOD MODAL                                  */}
      {/* ========================================================= */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e8e2dc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e2dc] pb-3">
              <h3 className="font-serif text-base font-semibold text-[#2d1b11]">Add Payment Method</h3>
              <button
                type="button"
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="text-[#82746d] hover:text-[#2d1b11]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPaymentType("UPI")}
                  className={`flex-1 py-2 rounded-xl font-semibold border transition-colors ${
                    newPaymentType === "UPI"
                      ? "bg-[#553722] text-white border-[#553722]"
                      : "bg-[#fbf9f8] text-[#50453e] border-[#d8cec5]"
                  }`}
                >
                  UPI ID / VPA
                </button>
                <button
                  type="button"
                  onClick={() => setNewPaymentType("CARD")}
                  className={`flex-1 py-2 rounded-xl font-semibold border transition-colors ${
                    newPaymentType === "CARD"
                      ? "bg-[#553722] text-white border-[#553722]"
                      : "bg-[#fbf9f8] text-[#50453e] border-[#d8cec5]"
                  }`}
                >
                  Credit / Debit Card
                </button>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b11] mb-1">
                  {newPaymentType === "UPI" ? "Virtual Payment Address (VPA / UPI ID)" : "Card Number"}
                </label>
                <input
                  type="text"
                  required
                  value={newPaymentValue}
                  onChange={(e) => setNewPaymentValue(e.target.value)}
                  placeholder={newPaymentType === "UPI" ? "e.g. mobile@okhdfcbank" : "16-digit card number"}
                  className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#82746d] hover:bg-[#f6f3f2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2 rounded-xl text-xs font-semibold"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADDRESS MODAL                                             */}
      {/* ========================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e8e2dc] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e2dc] pb-3">
              <div className="flex items-center gap-2 text-[#2d1b11]">
                <MapPin className="w-4 h-4 text-[#553722]" />
                <h3 className="font-serif text-base font-semibold">
                  {editingAddressId ? "Edit Delivery Address" : "New Delivery Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-[#82746d] hover:text-[#2d1b11] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b11] mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b11] mb-1">
                  10-Digit Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b11] mb-1">
                  Street Address & House / Flat No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="Flat 402, Rosewood Heights, MG Road"
                  className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b11] mb-1">
                  Apartment / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                  placeholder="Near Shivaji Park"
                  className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d1b11] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b11] mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2d1b11] mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="400001"
                    className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-3 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b11] mb-1">
                    Type
                  </label>
                  <select
                    value={addressForm.type}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        type: e.target.value as "HOME" | "WORK" | "OTHER",
                      })
                    }
                    className="w-full bg-[#fbf9f8] border border-[#d8cec5] rounded-xl px-2.5 py-2 text-xs text-[#2d1b11] focus:outline-none focus:border-[#553722]"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2d1b11]">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#553722] rounded cursor-pointer"
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#e8e2dc] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#82746d] hover:bg-[#f6f3f2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#553722] hover:bg-[#3d2617] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
