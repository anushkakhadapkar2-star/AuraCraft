import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import AdminSearchClient from "./AdminSearchClient";

export const metadata = {
  title: "Search Results | Aura Craft Admin",
};

export default async function AdminSearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const q = typeof searchParams?.q === 'string' ? searchParams.q : "";

  return <AdminSearchClient initialQuery={q} />;
}
