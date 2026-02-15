export const dynamic = "force-dynamic";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { getSystemSettings } from "@/services/system.service";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();

  return (
    <SidebarProvider>
      <AppSidebar settings={settings} />
      <SidebarInset>
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
