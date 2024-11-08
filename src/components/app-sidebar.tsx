import {
  HomeIcon,
  Inbox,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ThemeToggle from "./ui/theme-toggle";
import { Link } from "react-router-dom";
import { CheckIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Drawing",
    url: "/draw",
    icon: Inbox,
  },
  {
    title: "Check In", 
    url: "/check-in",
    icon: CheckIcon
  },
  {
    title: "Settings", 
    url: "/settings",
    icon: Settings
  }

];

export function AppSidebar() {
  const { logout } = useKindeAuth();

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lucky Draw: Drawer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <ThemeToggle />
              <Button onClick={logout}>Logout</Button>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
