import { RoleBasedChatPage } from "@/components/chat/role-based-chat-page";

export default function FarmerChatPage(props: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <RoleBasedChatPage {...props} currentRole="farmer" otherRoles={["admin"]} />
  );
}
