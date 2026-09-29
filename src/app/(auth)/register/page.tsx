import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Aura Craft",
  description: "Create your Aura Craft account",
};

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem-16rem)] py-12">
      <RegisterForm />
    </div>
  );
}
