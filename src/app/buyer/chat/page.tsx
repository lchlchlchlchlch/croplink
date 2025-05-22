import { ChatListPage } from "@/components/chat/ChatListPage";

export default function FarmerChatListPage() {
  return <ChatListPage currentRole="buyer" otherRoles={["admin"]} />;
}
