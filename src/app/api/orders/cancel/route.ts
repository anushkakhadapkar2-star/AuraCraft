import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, runTransaction, increment } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, reason, note } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const orderRef = doc(db, "orders", orderId);

    const result = await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("Order not found.");
      }

      const orderData = orderSnap.data();

      // Check ownership
      const isOwner = orderData.userId === session.user.uid;
      const isAdmin = session.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new Error("You do not have permission to cancel this order.");
      }

      // Check current status
      if (orderData.orderStatus === "CANCELLED") {
        throw new Error("This order is already cancelled.");
      }

      if (orderData.orderStatus === "DELIVERED") {
        throw new Error("Delivered orders cannot be cancelled. Please contact customer support for returns.");
      }

      // Update Order Status
      transaction.update(orderRef, {
        orderStatus: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReason: reason || "Cancelled by customer",
        cancelNote: note || "",
        cancelledBy: isAdmin ? "ADMIN" : "CUSTOMER",
        updatedAt: new Date().toISOString()
      });

      // Restore Inventory stock for each product item
      if (Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.productId && item.quantity) {
            const productRef = doc(db, "products", item.productId);
            transaction.update(productRef, {
              "inventory.currentStock": increment(item.quantity)
            });
          }
        }
      }

      return { id: orderId, status: "CANCELLED" };
    });

    return NextResponse.json({
      success: true,
      message: "Order has been cancelled successfully.",
      order: result
    });

  } catch (error: any) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order. Please try again." },
      { status: 400 }
    );
  }
}

