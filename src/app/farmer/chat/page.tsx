// src/app/chat/page.tsx
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Your existing component
import { redirect } from "next/navigation";
import { headers } from "next/headers"; // To get headers for the session
import { auth } from "@/lib/auth"; // Your better-auth instance


import {
  getMessages,
  getOrCreateDefaultChatRoom,
} from "@/actions/chat"; // Adjust the import path as necessary
import { ChatInterface } from "@/app/farmer/components/chat/ChatInterface";
import { db } from "@/db"; // Drizzle instance
import * as schema from "@/db/schema"; // Drizzle schema

// --- BETTER-AUTH: Implemented using your pattern from Home page ---
async function getAuthenticatedUserFromBetterAuthPage(): Promise<{ id: string; name: string | null; image: string | null } | null> {
  const sessionHeaders = await headers(); // Get headers instance for the current request
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (session?.user) {
    // Ensure these properties exist on session.user from your better-auth setup.
    // Adjust property names if they are different in your session.user object (e.g., session.user.username).
    const userId = (session.user as any).id; // Cast or ensure 'id' is on user type
    const userName = (session.user as any).name || null; // Cast or ensure 'name' is on user type
    const userImage = (session.user as any).image || null; // Cast or ensure 'image' is on user type

    if (!userId || typeof userId !== 'string') {
        console.error("Authenticated user from better-auth is missing a valid 'id'. Session:", session);
        return null;
    }

    return {
      id: userId,
      name: userName,
      image: userImage,
    };
  }
  console.log("No active session found via better-auth for chat page.");
  return null;
}
// --- END BETTER-AUTH ---

// Helper function to fetch all users for the map (can be optimized for larger apps)
async function getAllUsersMap(): Promise<Map<string, { name: string | null; image: string | null }>> {
  try {
    const users = await db.select({
      id: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
    }).from(schema.user);

    const userMap = new Map<string, { name: string | null; image: string | null }>();
    users.forEach(user => {
      userMap.set(user.id, { name: user.name, image: user.image });
    });
    return userMap;
  } catch (error) {
    console.error("Error fetching all users for map:", error);
    return new Map(); // Return an empty map on error
  }
}

const ChatPage = async () => {
  const currentUser = await getAuthenticatedUserFromBetterAuthPage();

  if (!currentUser?.id) {
    // Redirect to your login page, potentially with a callback URL
    // Your Home page redirects to `/${session.user.role}` on successful login.
    // We need a generic login page here. Let's assume it's at '/login' or root.
    // If your root page is the login form, this is fine.
    console.log("ChatPage: User not authenticated, redirecting to login.");
    redirect("/?error=unauthenticated&callbackUrl=/chat"); // Or your designated login page
  }

  const chatRoom = await getOrCreateDefaultChatRoom();
  if (!chatRoom) {
    // This should ideally not happen if getOrCreateDefaultChatRoom is robust
    return (
      <main className="flex flex-col h-full items-center justify-center p-4">
        <p className="text-red-500 font-semibold">Error: Could not load chat room.</p>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page. If the problem persists, contact support.
        </p>
      </main>
    );
  }

  const initialMessages = await getMessages(chatRoom.id);
  const allUsersMap = await getAllUsersMap(); // Fetch the user data for client-side mapping

  return (
    <main className="flex flex-col h-full">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          {/* Ensure SidebarTrigger is correctly imported and works if you use it */}
          {typeof SidebarTrigger !== 'undefined' ? (
            <SidebarTrigger className="-ml-1" />
          ) : (
            <div className="w-8 h-8 -ml-1" /> /* Placeholder if SidebarTrigger is missing */
          )}
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">
            Chat ({chatRoom.name})
          </h1>
        </div>
      </header>

      <ChatInterface
        initialMessages={initialMessages}
        chatRoomId={chatRoom.id}
        currentUserId={currentUser.id} // currentUser is now guaranteed to have an id
        allUsersMap={allUsersMap}       // Pass the map to the client component
      />
    </main>
  );
};

export default ChatPage;