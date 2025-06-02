import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Communications() {
  const [messageText, setMessageText] = useState("");
  const [selectedChat, setSelectedChat] = useState<string>("team");
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const messageData = {
      fromUserId: user?.id || "guest",
      toUserId: selectedChat === "team" ? null : selectedChat,
      subject: "Quick Message",
      content: messageText.trim(),
      priority: "normal",
      messageType: selectedChat === "team" ? "broadcast" : "direct"
    };

    sendMessageMutation.mutate(messageData);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message: any) => {
    return message.fromUserId === user?.id;
  };

  const filteredMessages = messages.filter((message: any) => {
    if (selectedChat === "team") {
      return message.messageType === "broadcast" || message.messageType === "announcement";
    }
    return (message.fromUserId === user?.id && message.toUserId === selectedChat) ||
           (message.fromUserId === selectedChat && message.toUserId === user?.id);
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Team Chat */}
            <div 
              onClick={() => setSelectedChat("team")}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === "team" ? "bg-fc-red/10 border-r-4 border-r-fc-red" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-fc-red rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Team Chat</h3>
                  <p className="text-sm text-gray-500">Everyone • Announcements</p>
                </div>
              </div>
            </div>

            {/* Individual Chats */}
            {players.map((player: any) => (
              <div 
                key={player.id}
                onClick={() => setSelectedChat(player.id.toString())}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat === player.id.toString() ? "bg-fc-red/10 border-r-4 border-r-fc-red" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {player.firstName} {player.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{player.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedChat === "team" ? "bg-fc-red" : "bg-gray-300"
              }`}>
                <i className={`fas ${selectedChat === "team" ? "fa-users" : "fa-user"} text-white text-sm`}></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedChat === "team" ? "Team Chat" : 
                   players.find((p: any) => p.id.toString() === selectedChat)?.firstName + " " + 
                   players.find((p: any) => p.id.toString() === selectedChat)?.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedChat === "team" ? "Team announcements and updates" : "Direct message"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Loading messages...</div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center text-gray-500">
                  <i className="fas fa-comments text-4xl mb-2"></i>
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              filteredMessages.map((message: any, index: number) => (
                <div 
                  key={index}
                  className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMyMessage(message) 
                        ? "bg-fc-red text-white" 
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {!isMyMessage(message) && selectedChat === "team" && (
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {message.fromUserId}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      isMyMessage(message) ? "text-red-100" : "text-gray-500"
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${selectedChat === "team" ? "team" : "..."}`}
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-fc-red hover:bg-fc-red/90 text-white px-6"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}