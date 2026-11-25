"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Loader2, Mail, MailOpen, Trash2, Search, X, Check, AlertCircle, Phone, ExternalLink, Calendar, User, Sparkles } from "lucide-react";

export default function MessagesClient() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === "read") return;
    try {
      await updateDoc(doc(db, "contact_messages", id), { status: "read" });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "contact_messages", messageToDelete.id));
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      showFeedback("success", "Message deleted.");
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      showFeedback("error", "Failed to delete message.");
    } finally {
      setIsDeleting(false);
    }
  };

  const unreadCount = useMemo(() => messages.filter(m => m.status === "unread").length, [messages]);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (filter === "UNREAD" && msg.status !== "unread") return false;
      if (filter === "READ" && msg.status === "unread") return false;

      const q = search.toLowerCase();
      const matchName = msg.fullName?.toLowerCase().includes(q);
      const matchEmail = msg.email?.toLowerCase().includes(q);
      const matchSubject = msg.subject?.toLowerCase().includes(q);
      const matchBody = msg.message?.toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchBody;
    });
  }, [messages, filter, search]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F4EE] text-[#563A29]">
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
      <header className="sticky top-0 z-20 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E9DCCB]/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#563A29]">
                Customer Inquiries & Messages
              </h1>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A4AD91]/20 text-[#3d4b29] border border-[#A4AD91]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3d4b29] animate-pulse"></span>
                  {unreadCount} Unread Inquiries
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F2] text-[#563A29]/70 border border-[#E9DCCB]">
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-xs text-[#563A29]/70 mt-1 font-sans">
              Read customer queries, custom hamper questions, and artisan commission requests.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#563A29]/60">Total Messages</div>
            <div className="text-xl font-bold font-serif text-[#563A29] mt-1">{messages.length}</div>
            <div className="text-[11px] text-[#563A29]/60 mt-0.5 font-medium">All customer submissions</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">Pending Unread</div>
            <div className="text-xl font-bold font-serif text-[#92400e] mt-1">{unreadCount}</div>
            <div className="text-[11px] text-[#92400e]/80 mt-0.5 font-medium">Requires customer reply</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-[#E9DCCB] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f5223]">Archived / Read</div>
            <div className="text-xl font-bold font-serif text-[#0f5223] mt-1">{messages.length - unreadCount}</div>
            <div className="text-[11px] text-[#0f5223]/80 mt-0.5 font-medium">Reviewed inquiries</div>
          </div>
        </div>

        {/* Two-Pane Messaging Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Messages List */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E9DCCB] overflow-hidden flex flex-col h-[650px] shadow-xs">
            {/* List Header & Filters */}
            <div className="p-4 border-b border-[#E9DCCB] bg-[#FAF7F2] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#563A29]/50" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-[#E9DCCB] rounded-xl pl-8.5 pr-8 py-2 text-xs text-[#563A29] placeholder-[#563A29]/40 focus:outline-none focus:border-[#563A29] transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#563A29]/50 p-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-1.5">
                {(["ALL", "UNREAD", "READ"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`btn-press flex-1 py-1 rounded-lg text-[11px] font-bold transition-all text-center ${filter === tab
                        ? "bg-[#563A29] text-white shadow-xs"
                        : "bg-white text-[#563A29]/70 hover:bg-[#E9DCCB]/40 border border-[#E9DCCB]"
                      }`}
                  >
                    {tab === "ALL" ? `All (${messages.length})` : tab === "UNREAD" ? `Unread (${unreadCount})` : `Read`}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto flex-1 p-3 space-y-2 divide-y divide-[#E9DCCB]/30">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#563A29]/60">
                  <Loader2 className="w-6 h-6 animate-spin text-[#563A29] mb-2" />
                  <span className="text-xs">Loading inquiries...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-16 text-[#563A29]/60 p-4">
                  <Mail className="w-8 h-8 text-[#CDAE91] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-[#563A29]">No messages found</p>
                  <p className="text-[11px] text-[#563A29]/60 mt-0.5">Try searching with a different term.</p>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isSelected = selectedMessage?.id === msg.id;
                  const isUnread = msg.status === "unread";

                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        markAsRead(msg.id, msg.status);
                      }}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isSelected
                          ? "bg-[#FAF7F2] border-[#563A29] shadow-xs"
                          : isUnread
                            ? "bg-[#FAF7F2]/80 border-[#CDAE91] shadow-2xs"
                            : "bg-white border-transparent hover:bg-[#FAF7F2]/40"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isUnread && <span className="w-2 h-2 rounded-full bg-[#CDAE91] shrink-0" />}
                          <h3 className={`text-xs truncate ${isUnread ? "font-bold text-[#563A29]" : "font-medium text-[#563A29]/80"}`}>
                            {msg.fullName || "Anonymous Customer"}
                          </h3>
                        </div>
                        {isUnread ? (
                          <Mail className="w-3.5 h-3.5 text-[#CDAE91] shrink-0 ml-1" />
                        ) : (
                          <MailOpen className="w-3.5 h-3.5 text-[#563A29]/40 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[#563A29] truncate mb-1">
                        {msg.subject || "(No Subject)"}
                      </p>
                      <p className="text-[11px] text-[#563A29]/65 line-clamp-1">
                        {msg.message}
                      </p>
                      <div className="text-[10px] text-[#563A29]/50 mt-1.5 flex items-center justify-between">
                        <span>{msg.email}</span>
                        <span>{msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString("en-IN") : 'Just now'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Message Details Preview */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E9DCCB] overflow-hidden h-[650px] flex flex-col shadow-xs">
            {selectedMessage ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-[#E9DCCB] bg-[#FAF7F2] flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-serif font-bold text-lg text-[#563A29] mb-1">
                      {selectedMessage.subject || "(No Subject)"}
                    </h2>
                    <div className="text-xs text-[#563A29]/80 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#CDAE91]" />
                        <span><strong>From:</strong> {selectedMessage.fullName}</span>
                        <span className="text-[#563A29]/40">•</span>
                        <a href={`mailto:${selectedMessage.email}`} className="text-[#563A29] underline hover:text-[#3d2719]">
                          {selectedMessage.email}
                        </a>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#CDAE91]" />
                          <span><strong>Phone:</strong> {selectedMessage.phone}</span>
                          <span className="text-[#563A29]/40">•</span>
                          <a
                            href={`https://wa.me/91${selectedMessage.phone?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0f5223] font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-[#563A29]/60">
                        <Calendar className="w-3.5 h-3.5 text-[#CDAE91]" />
                        <span>{selectedMessage.createdAt?.toDate ? new Date(selectedMessage.createdAt.toDate()).toLocaleString("en-IN") : 'Just now'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMessageToDelete(selectedMessage)}
                    className="btn-press p-2 text-[#ba1a1a] hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 text-xs sm:text-sm text-[#563A29] whitespace-pre-wrap leading-relaxed bg-white">
                  {selectedMessage.message}
                </div>

                {/* Footer Reply Action */}
                <div className="p-4 border-t border-[#E9DCCB] bg-[#FAF7F2] flex items-center justify-between">
                  <span className="text-xs text-[#563A29]/70 font-medium">
                    Reply opens directly in your mail client
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "Your Aura Craft Inquiry")}`}
                      className="btn-press btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 bg-[#563A29] text-white rounded-xl text-xs font-semibold hover:bg-[#3d2719] transition-all shadow-xs min-h-[44px]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#CDAE91]" />
                      <span>Reply via Email</span>
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#563A29]/50 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#CDAE91] flex items-center justify-center mx-auto mb-3 border border-[#E9DCCB]">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#563A29]">Select an Inquiry to Read</h3>
                <p className="text-xs text-[#563A29]/65 max-w-xs mt-1">
                  Choose a customer query from the left panel to review inquiry details, contact numbers, and compose an email response.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E9DCCB] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-[#563A29]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Delete Message?</h3>
                <p className="text-xs text-[#563A29]/70">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#563A29]/80 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#E9DCCB]">
              Are you sure you want to delete the message from <strong className="text-[#563A29]">{messageToDelete.fullName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="btn-press px-4 py-2.5 rounded-xl border border-[#E9DCCB] text-xs font-semibold text-[#563A29] hover:bg-[#FAF7F2] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn-press px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 min-h-[44px] inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Message</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
