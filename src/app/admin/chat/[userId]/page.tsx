import { RoleBasedChatPage } from "@/components/chat/RoleBasedChatPage";

export default function FarmerChatPage(props: any) {
  return (
    <RoleBasedChatPage
      {...props}
      currentRole="admin"
      otherRoles={["buyer", "farmer"]}
    />
  );
}
