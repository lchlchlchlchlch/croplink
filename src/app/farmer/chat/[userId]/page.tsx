import { RoleBasedChatPage } from "@/components/chat/RoleBasedChatPage";

export default function FarmerChatPage(props: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <RoleBasedChatPage {...props} currentRole="farmer" otherRoles={["admin"]} />
  );
}
