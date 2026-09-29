"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";

export default function MessagesClient() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

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

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, "contact_messages", id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-sm text-primary mb-2">Contact Messages</h1>
        <p className="text-on-surface-variant">View and manage messages from your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low">
            <h2 className="font-headline-sm text-primary">Inbox ({messages.length})</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {messages.length === 0 ? (
              <p className="text-center p-6 text-on-surface-variant">No messages yet.</p>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => {
                    setSelectedMessage(msg);
                    markAsRead(msg.id, msg.status);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-colors border ${
                    selectedMessage?.id === msg.id 
                      ? "bg-primary/10 border-primary/30" 
                      : msg.status === "unread" 
                        ? "bg-surface border-outline-variant/50 shadow-sm" 
                        : "bg-surface-container-lowest border-transparent opacity-70"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-headline-sm ${msg.status === 'unread' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {msg.fullName}
                    </h3>
                    {msg.status === "unread" ? (
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm font-label-caps text-on-surface-variant truncate mb-2">{msg.subject}</p>
                  <p className="text-xs text-on-surface-variant/70">
                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2 bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden h-[600px] flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-start gap-4">
                <div>
                  <h2 className="font-display-sm text-primary mb-2">{selectedMessage.subject}</h2>
                  <div className="font-body-md text-on-surface-variant space-y-1">
                    <p><span className="font-label-caps mr-2">From:</span> {selectedMessage.fullName} ({selectedMessage.email})</p>
                    {selectedMessage.phone && <p><span className="font-label-caps mr-2">Phone:</span> {selectedMessage.phone}</p>}
                    <p><span className="font-label-caps mr-2">Date:</span> {selectedMessage.createdAt?.toDate ? new Date(selectedMessage.createdAt.toDate()).toLocaleString() : 'Just now'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 font-body-lg text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
              <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-6 py-2 bg-primary text-on-primary btn-radius font-headline-sm hover:bg-tertiary transition-colors"
                >
                  Reply via Email
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/50">
              <Mail className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-headline-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
