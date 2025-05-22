import { ChatListPage } from "@/components/chat/chat-list-page";

export default function FarmerChatListPage() {
  return <ChatListPage currentRole="farmer" otherRoles={["admin"]} />;
}
