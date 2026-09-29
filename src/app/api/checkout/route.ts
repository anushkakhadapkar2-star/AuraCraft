import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/firebase/client";
import { doc, collection, runTransaction, increment } from "firebase/firestore";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, totalAmount, subtotal, shipping, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderRef = doc(collection(db, "orders"));
    const addressRef = doc(collection(db, "users", session.user.uid, "addresses"));

    const fullOrderData = await runTransaction(db, async (transaction) => {
      // 1. Verify and deduct inventory for each item
      const productDocs = await Promise.all(
        items.map((item: any) => transaction.get(doc(db, "products", item.productId)))
      );

      productDocs.forEach((productDoc, index) => {
        const item = items[index];
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const data = productDoc.data() as any;
        const currentStock = data.inventory?.currentStock ?? 0;
        
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${data.name}`);
        }

        // Deduct stock
        transaction.update(productDoc.ref, {
          "inventory.currentStock": increment(-item.quantity)
        });
      });

      // 2. Save the Shipping Address
      transaction.set(addressRef, {
        type: "HOME",
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        apartment: shippingAddress.apartment || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        createdAt: new Date().toISOString()
      });

      // 3. Create the Order
      const orderData = {
        id: orderRef.id,
        userId: session.user.uid,
        totalAmount,
        subtotal,
        shipping,
        discount: 0,
        tax: 0,
        orderStatus: "ORDER_PLACED",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        paymentMethod: paymentMethod || "COD",
        shippingAddress: shippingAddress,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      transaction.set(orderRef, orderData);

      // Return full data for email
      return {
        ...orderData,
        items: items.map((item: any, index: number) => ({
          ...item,
          product: productDocs[index].data()
        }))
      };
    });

    // Send confirmation email asynchronously
    const targetEmail = session.user.email || shippingAddress.email;
    if (targetEmail) {
      console.log(`Attempting to send order confirmation to ${targetEmail}`);
      sendOrderConfirmationEmail(fullOrderData, targetEmail, session.user.name || shippingAddress.fullName || "Customer")
        .then(() => console.log("Email sent successfully promise resolved"))
        .catch((e) => console.error("Email send failed", e));
    } else {
      console.warn(`Cannot send order confirmation email: No email found in session or shipping address for user ${session.user.uid}`);
    }

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
