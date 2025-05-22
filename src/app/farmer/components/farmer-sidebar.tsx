"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { HandCoinsIcon, MessageCircleIcon, UserIcon } from "lucide-react";

// farmer sidebar links
const data = {
  navMain: [
    {
      title: "Request",
      url: "/farmer",
      icon: HandCoinsIcon,
    },
    {
      title: "Chat",
      url: "/farmer/chat",
      icon: MessageCircleIcon,
    },
    {
      title: "Profile",
      url: "/farmer/profile",
      icon: UserIcon,
    },
  ],
};

export function FarmerSidebar() {
  return <AppSidebar data={data} title={"Farmer"} />;
}
