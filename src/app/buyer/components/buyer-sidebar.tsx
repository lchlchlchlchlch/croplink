"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  MessageCircleIcon,
  HistoryIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";

const data = {
  navMain: [
    {
      title: "Order",
      url: "/buyer",
      icon: TruckIcon,
    },
    {
      title: "Order History",
      url: "/buyer/order-history",
      icon: HistoryIcon,
    },
    {
      title: "Chat",
      url: "/buyer/chat",
      icon: MessageCircleIcon,
    },
    {
      title: "Profile",
      url: "/buyer/profile",
      icon: UserIcon,
    },
  ],
};

export function BuyerSidebar() {
  return <AppSidebar data={data} title="Buyer" />;
}
