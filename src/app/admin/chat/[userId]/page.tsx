import { RoleBasedChatPage } from "@/components/chat/role-based-chat-page";

export default function AdminChatPage(props: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <RoleBasedChatPage
      {...props}
      currentRole="admin"
      otherRoles={["buyer", "farmer"]}
    />
  );
}
