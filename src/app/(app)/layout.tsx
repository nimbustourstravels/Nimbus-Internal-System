import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
          <div className="text-sm text-neutral-500">
            {employee?.name ?? user.email}
            {employee?.role === "admin" && (
              <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-white">
                Admin
              </span>
            )}
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
