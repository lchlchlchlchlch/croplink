import { RoleBasedChatPage } from "@/components/chat/role-based-chat-page";

export default function BuyerChatPage(props: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <RoleBasedChatPage {...props} currentRole="buyer" otherRoles={["admin"]} />
  );
}
