import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Users, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Communications() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
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
    setActiveChat(player);
    setSelectedRecipient(player.id.toString());
    setIsPrivateChatOpen(true);
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
                            <span>{player.name}</span>
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
                  (messages as any[]).map((message: any) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.senderName}</span>
                          {message.messageType === "private" && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                          {message.recipientName && (
                            <span className="text-sm text-gray-500">
                              → {message.recipientName}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
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
    </div>
  );
}