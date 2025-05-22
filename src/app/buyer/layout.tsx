import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BuyerSidebar } from "./_components/buyer-sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CropLink | Buyer",
  description: "TSA Software Development 2025",
};

// layout with buyer sidebar
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset className="border">{children}</SidebarInset>
    </SidebarProvider>
  );
}

