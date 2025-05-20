import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ChatPage = async () => {
  return (
    <main className="flex flex-col h-full">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Chat</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg bg-muted p-3 text-sm">Yo</div>
          </div>
          <div className="mb-4 flex justify-end">
            <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
              hey
            </div>
          </div>
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg bg-muted p-3 text-sm">
              u thinkin what im thinking
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-input bg-background p-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
