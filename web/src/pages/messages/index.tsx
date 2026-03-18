import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <h2 className="text-xl font-bold tracking-tight">Messages</h2>
      </header>

      {/* Empty State - Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Mail className="size-10 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">Messages Coming Soon</h3>
        
        <p className="text-muted-foreground max-w-md mb-6">
          Direct messaging feature is currently under development. 
          Soon you'll be able to chat privately with other users!
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="size-5 text-primary shrink-0" />
            <span className="text-sm text-left">Private conversations with followers</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="size-5 text-primary shrink-0" />
            <span className="text-sm text-left">Group chats with multiple users</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="size-5 text-primary shrink-0" />
            <span className="text-sm text-left">Share posts directly in messages</span>
          </div>
        </div>

        <Button variant="outline" className="mt-8" disabled>
          <Mail className="size-4 mr-2" />
          Notify me when ready
        </Button>
      </div>
    </div>
  );
}
