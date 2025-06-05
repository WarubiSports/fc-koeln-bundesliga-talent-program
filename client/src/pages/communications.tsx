import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Users, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PrivateChat {
  id: string;
  participant: any;
  messages: any[];
  isMinimized: boolean;
  newMessage: string;
}

export default function Communications() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState(false);
  const [activeChats, setActiveChats] = useState<PrivateChat[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  // Send team message mutation
  const sendTeamMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("/api/messages", "POST", {
        content,
        messageType: "team",
        senderName: `${user?.firstName} ${user?.lastName}`,
        senderId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your team message has been sent successfully",
      });
    }
  });

  // Send private message mutation
  const sendPrivateMessageMutation = useMutation({
    mutationFn: async (data: { content: string; recipientId: string; recipientName: string }) => {
      return apiRequest("/api/messages", "POST", {
        content: data.content,
        messageType: "private",
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        senderName: `${user?.firstName} ${user?.lastName}`,
        senderId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setPrivateMessage("");
      setIsPrivateChatOpen(false);
      setSelectedRecipient("");
      toast({
        title: "Private message sent",
        description: "Your private message has been sent successfully",
      });
    }
  });

  const handleSendTeamMessage = () => {
    if (newMessage.trim()) {
      sendTeamMessageMutation.mutate(newMessage);
    }
  };

  const handleSendPrivateMessage = () => {
    if (privateMessage.trim() && selectedRecipient) {
      const recipient = (players as any[]).find(p => p.id.toString() === selectedRecipient);
      if (recipient) {
        sendPrivateMessageMutation.mutate({
          content: privateMessage,
          recipientId: selectedRecipient,
          recipientName: recipient.name
        });
      }
    }
  };

  const startPrivateChat = (player: any) => {
    const chatId = `${user?.id}-${player.id}`;
    const existingChat = activeChats.find(chat => chat.id === chatId);
    
    if (!existingChat) {
      const newChat: PrivateChat = {
        id: chatId,
        participant: player,
        messages: [],
        isMinimized: false,
        newMessage: ""
      };
      setActiveChats(prev => [...prev, newChat]);
    } else {
      // Unminimize existing chat
      setActiveChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, isMinimized: false } : chat
      ));
    }
  };

  const closePrivateChat = (chatId: string) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const minimizeChat = (chatId: string) => {
    setActiveChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMinimized: !chat.isMinimized } : chat
    ));
  };

  const updateChatMessage = (chatId: string, message: string) => {
    setActiveChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, newMessage: message } : chat
    ));
  };

  const sendPrivateChatMessage = async (chatId: string) => {
    const chat = activeChats.find(c => c.id === chatId);
    if (!chat || !chat.newMessage.trim()) return;

    try {
      await apiRequest("/api/messages", "POST", {
        content: chat.newMessage,
        messageType: "private",
        recipientId: chat.participant.id.toString(),
        recipientName: `${chat.participant.firstName} ${chat.participant.lastName}`,
        senderName: `${user?.firstName} ${user?.lastName}`,
        senderId: user?.id
      });

      updateChatMessage(chatId, "");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      toast({
        title: "Message sent",
        description: `Private message sent to ${chat.participant.firstName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Filter private messages for each chat
  const getPrivateMessages = (chatId: string) => {
    const chat = activeChats.find(c => c.id === chatId);
    if (!chat) return [];
    
    return (messages as any[]).filter((message: any) => {
      const isPrivate = message.message_type === "private" || message.messageType === "private";
      const fromParticipant = message.from_user_id === chat.participant.id.toString() && message.to_user_id === user?.id;
      const toParticipant = message.from_user_id === user?.id && message.to_user_id === chat.participant.id.toString();
      
      return isPrivate && (fromParticipant || toParticipant);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Communications</h1>
            <p className="text-gray-600">Stay connected with your team</p>
          </div>
          <Dialog open={isPrivateChatOpen} onOpenChange={setIsPrivateChatOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Private Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Private Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Player</label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {(players as any[]).map((player: any) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{player.firstName} {player.lastName}</span>
                            <Badge variant="outline" className="text-xs">
                              {player.position}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    placeholder="Type your private message..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPrivateChatOpen(false);
                      setPrivateMessage("");
                      setSelectedRecipient("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendPrivateMessage}
                    disabled={!privateMessage.trim() || !selectedRecipient || sendPrivateMessageMutation.isPending}
                  >
                    {sendPrivateMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Team Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {isLoading ? (
                  <div className="text-center py-8">Loading messages...</div>
                ) : (messages as any[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  (messages as any[])
                    .filter((message: any) => message.message_type === "team" || message.messageType === "team")
                    .map((message: any) => (
                    <div key={message.id} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(message.subject || message.senderName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {message.subject || message.senderName || "Unknown User"}
                            </span>
                            <div className="text-xs text-gray-500">
                              {new Date(message.created_at || message.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Team
                        </Badge>
                      </div>
                      <p className="text-gray-700 mt-2">{message.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your team message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTeamMessage()}
                />
                <Button 
                  onClick={handleSendTeamMessage}
                  disabled={!newMessage.trim() || sendTeamMessageMutation.isPending}
                >
                  {sendTeamMessageMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(players as any[]).map((player: any) => (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => startPrivateChat(player)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="text-sm font-medium">{player.name}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {player.position}
                          </Badge>
                          {player.house && (
                            <Badge variant="secondary" className="text-xs">
                              {player.house}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <MessageCircle className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                  </div>
                ))}
                {(players as any[]).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No players available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Private Chat Windows */}
      <div className="fixed bottom-0 right-4 flex gap-2 z-50">
        {activeChats.map((chat, index) => (
          <div 
            key={chat.id}
            className="w-80 bg-white border border-gray-200 rounded-t-lg shadow-lg"
            style={{ marginRight: index * 20 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center text-xs font-medium">
                  {chat.participant.firstName?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium">
                  {chat.participant.firstName} {chat.participant.lastName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                  onClick={() => minimizeChat(chat.id)}
                >
                  {chat.isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                  onClick={() => closePrivateChat(chat.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!chat.isMinimized && (
              <div className="flex flex-col h-80">
                {/* Messages Area */}
                <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                  {getPrivateMessages(chat.id).length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Start your private conversation with {chat.participant.firstName}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getPrivateMessages(chat.id).map((message: any) => {
                        const isFromMe = message.from_user_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs p-2 rounded-lg text-sm ${
                                isFromMe
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`text-xs mt-1 ${isFromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                {new Date(message.created_at || message.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={chat.newMessage}
                      onChange={(e) => updateChatMessage(chat.id, e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && sendPrivateChatMessage(chat.id)}
                    />
                    <Button
                      size="sm"
                      onClick={() => sendPrivateChatMessage(chat.id)}
                      disabled={!chat.newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}