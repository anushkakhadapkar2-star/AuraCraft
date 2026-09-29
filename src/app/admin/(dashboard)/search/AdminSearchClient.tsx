"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Package, Users, ShoppingBag, Search } from "lucide-react";
import Image from "next/image";

interface AdminSearchClientProps {
  initialQuery: string;
}

export default function AdminSearchClient({ initialQuery }: AdminSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))
      ]);

      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error fetching data for search:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingAddress?.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface">
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-6">
        <h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Search across products, orders, and customers.</p>
        
        <div className="mt-4 relative max-w-2xl">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-surface-container-low font-body-md"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Products Results */}
            {filteredProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Package className="w-5 h-5" />
                  <h3 className="font-headline-sm">Products ({filteredProducts.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.slice(0, 6).map(product => (
                    <Link href={`/admin/products`} key={product.id} className="flex gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary transition-colors">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container relative shrink-0">
                        {product.images?.[0]?.url && <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-primary truncate">{product.name}</h4>
                        <p className="text-sm text-on-surface-variant truncate font-mono mt-1">ID: {product.id.slice(0,8)}...</p>
                        <p className="text-sm font-semibold mt-1">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Orders Results */}
            {filteredOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="font-headline-sm">Orders ({filteredOrders.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.slice(0, 6).map(order => (
                    <Link href={`/admin/orders`} key={order.id} className="flex flex-col p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-semibold text-primary">#{order.id.slice(0,8)}...</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high font-medium">{order.orderStatus}</span>
                      </div>
                      <p className="font-medium text-on-surface truncate">{order.shippingAddress?.fullName}</p>
                      <p className="text-sm text-on-surface-variant mb-2">{order.shippingAddress?.phone}</p>
                      <p className="font-semibold">₹{order.totalAmount?.toFixed(2)}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Users Results */}
            {filteredUsers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Users className="w-5 h-5" />
                  <h3 className="font-headline-sm">Customers ({filteredUsers.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredUsers.slice(0, 6).map(user => (
                    <Link href={`/admin/customers`} key={user.id} className="flex gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-primary truncate">{user.name || 'Unknown'}</h4>
                        <p className="text-sm text-on-surface-variant truncate mt-1">{user.email}</p>
                        <p className="text-sm text-on-surface-variant truncate">{user.phone}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredProducts.length === 0 && filteredOrders.length === 0 && filteredUsers.length === 0 && searchQuery && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-outline mx-auto mb-4" />
                <h3 className="font-headline-md text-primary mb-2">No results found</h3>
                <p className="text-on-surface-variant">We couldn't find anything matching "{searchQuery}"</p>
              </div>
            )}
            
            {!searchQuery && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-outline mx-auto mb-4" />
                <h3 className="font-headline-md text-primary mb-2">Start searching</h3>
                <p className="text-on-surface-variant">Type above to search across all your data</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
