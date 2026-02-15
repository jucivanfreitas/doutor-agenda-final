"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Gem,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type SystemSettings = Awaited<
  ReturnType<typeof import("@/services/system.service").getSystemSettings>
>;

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pacientes", url: "/patients", icon: UsersRound },
  { title: "Médicos", url: "/doctors", icon: Stethoscope },
  { title: "Agendamentos", url: "/appointments", icon: CalendarDays },
];

const navSecondary = [
  { title: "Assinatura", url: "/subscription", icon: Gem },
  // manter espaço para Suporte / Configurações se necessário
];

export function AppSidebar({ settings }: { settings?: SystemSettings | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/authentication"),
      },
    });
  };

  const appName = settings?.appName ?? "Pleno PSI";
  const logoUrl = settings?.logoUrl ?? "/logo.svg";

  return (
    <Sidebar className="bg-background border-r">
      <SidebarHeader className="border-b px-5 py-6">
        <div className="flex items-center gap-3">
          <Image
            src={logoUrl}
            alt={appName}
            width={34}
            height={34}
            className="shrink-0 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              {appName}
            </span>
            <span className="text-muted-foreground text-xs">
              {session.data?.user?.clinic?.name ?? "Sem clínica"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/80 px-3 pb-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Menu Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
                  >
                    <Link
                      href={item.url}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-foreground/80 px-3 pb-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Outros
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
                  >
                    <Link
                      href={item.url}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-2 transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm font-medium">
                      {session.data?.user?.clinic?.name?.[0] ?? "P"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-sm font-semibold">
                      {session.data?.user?.clinic?.name}
                    </span>
                    <span className="text-muted-foreground max-w-[150px] truncate text-xs">
                      {session.data?.user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
