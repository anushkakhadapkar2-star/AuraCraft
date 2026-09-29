import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ProfileSettingsClient from "./ProfileSettingsClient";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export const metadata = {
  title: "Profile Settings - Aura Craft",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.uid) {
    redirect("/login");
  }

  // Fetch fresh user data from Firestore
  let userData = null;
  try {
    const userSnap = await getDoc(doc(db, "users", session.user.uid));
    if (userSnap.exists()) {
      userData = userSnap.data();
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display-md text-primary mb-2">Profile Settings</h1>
        <p className="text-on-surface-variant font-body-md">Update your personal details and how we can reach you.</p>
      </div>

      <ProfileSettingsClient initialData={userData} uid={session.user.uid} />
    </div>
  );
}
