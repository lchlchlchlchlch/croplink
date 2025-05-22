import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CropLink | Admin",
  description: "TSA Software Development 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="border">{children}</SidebarInset>
    </SidebarProvider>
  );
}
