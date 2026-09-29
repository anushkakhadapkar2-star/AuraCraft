import { Metadata } from "next";
import { Suspense } from "react";
import LoginFinishClient from "./LoginFinishClient";

export const metadata: Metadata = {
  title: "Completing Login | Aura Craft",
};

export default function LoginFinishPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem-16rem)] py-12">
      <Suspense fallback={<div className="text-center py-12 text-on-surface-variant font-body-md animate-pulse">Verifying secure link...</div>}>
        <LoginFinishClient />
      </Suspense>
    </div>
  );
}
