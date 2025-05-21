import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FarmerSidebar } from "./components/farmer-sidebar";

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
