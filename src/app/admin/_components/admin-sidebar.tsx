"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  ArchiveIcon,
  ListIcon,
  MessageCircleIcon,
  UserIcon,
} from "lucide-react";

// links for admin sidebar
const data = {
  navMain: [
    {
      title: "Inventory",
      url: "/admin",
      icon: ArchiveIcon,
    },
    {
      title: "Tickets",
      url: "/admin/tickets",
      icon: ListIcon,
    },
    {
      title: "Chat",
      url: "/admin/chat",
      icon: MessageCircleIcon,
    },
    {
      title: "Profile",
      url: "/admin/profile",
      icon: UserIcon,
    },
  ],
};

export function AdminSidebar() {
  return <AppSidebar data={data} title={"Admin"} />;
}
