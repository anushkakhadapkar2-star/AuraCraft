import MessagesClient from "./MessagesClient";

export const metadata = {
  title: "Messages Admin - Aura Craft",
  description: "View and manage contact form submissions.",
};

export default function MessagesPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <MessagesClient />
    </main>
  );
}
