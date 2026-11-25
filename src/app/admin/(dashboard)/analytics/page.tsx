import { db as serverDb } from "@/lib/firebase/client";
import { collection, getCountFromServer as getCount, getDocs, query, orderBy, limit } from "firebase/firestore";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = {
  title: "Commerce Analytics | Aura Craft Operations",
  description: "Real-time store performance, revenue trends, and artisan fulfillment analytics",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalUsers = 0;

  try {
    const [usersSnap, ordersCountSnap] = await Promise.all([
      getCount(collection(serverDb, "users")),
      getCount(collection(serverDb, "orders")),
    ]);

    totalUsers = usersSnap.data().count;
    totalOrders = ordersCountSnap.data().count;

    const ordersSnap = await getDocs(
      query(collection(serverDb, "orders"), orderBy("createdAt", "desc"), limit(50))
    );

    let sum = 0;
    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      sum += Number(data.totalAmount) || 0;
    });
    totalRevenue = sum;
  } catch (err) {
    console.error("Error fetching analytics metrics:", err);
  }

  return (
    <AnalyticsClient
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      totalUsers={totalUsers}
    />
  );
}
