import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BuyerSidebar } from "./components/buyer-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset className="border">{children}</SidebarInset>
    </SidebarProvider>
  );
}
