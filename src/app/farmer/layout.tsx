import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FarmerSidebar } from "./components/farmer-sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CropLink | Farmer",
  description: "TSA Software Development 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <FarmerSidebar />
      <SidebarInset className="border">{children}</SidebarInset>
    </SidebarProvider>
  );
}
