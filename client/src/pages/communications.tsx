import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { Message, InsertMessage, Player } from "@shared/schema";

export default function Communications() {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState<Partial<InsertMessage>>({
    subject: "",
    content: "",
    priority: "normal",
    messageType: "direct"
  });
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: players } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsNewMessageOpen(false);
      setNewMessage({
        subject: "",
        content: "",
        priority: "normal",
        messageType: "direct"
      });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message content.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      ...newMessage,
      fromUserId: user?.id || "",
      subject: newMessage.subject,
      content: newMessage.content,
      priority: newMessage.priority || "normal",
      messageType: newMessage.messageType || "direct"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const receivedMessages = messages?.filter(msg => 
    msg.toUserId === user?.id || msg.messageType === 'broadcast'
  ) || [];

  const sentMessages = messages?.filter(msg => 
    msg.fromUserId === user?.id
  ) || [];

  const unreadCount = receivedMessages.filter(msg => !msg.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                  {unreadCount} unread
                </span>
              )}
              Stay connected with your team
            </p>
          </div>

          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-fc-red hover:bg-fc-red/90 text-white">
                <i className="fas fa-plus mr-2"></i>
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="messageType">Message Type</Label>
                  <Select 
                    value={newMessage.messageType} 
                    onValueChange={(value) => setNewMessage(prev => ({ ...prev, messageType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      {isAdmin && <SelectItem value="broadcast">Broadcast to All</SelectItem>}
                      {isAdmin && <SelectItem value="announcement">Official Announcement</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                {newMessage.messageType === 'direct' && (
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select 
                      value={newMessage.toUserId || ""} 
                      onValueChange={(value) => setNewMessage(prev => ({ ...prev, toUserId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map(player => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newMessage.priority} 
                    onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="w-full bg-fc-red hover:bg-fc-red/90 text-white"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received Messages
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Sent Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {messagesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : receivedMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">You'll see incoming messages here</p>
                </CardContent>
              </Card>
            ) : (
              receivedMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-colors ${!message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => !message.isRead && markAsReadMutation.mutate(message.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                          {message.subject}
                        </h3>
                        <Badge className={getPriorityColor(message.priority || 'normal')}>
                          {message.priority}
                        </Badge>
                        {message.messageType === 'broadcast' && (
                          <Badge variant="outline">Broadcast</Badge>
                        )}
                        {message.messageType === 'announcement' && (
                          <Badge className="bg-fc-red text-white">Announcement</Badge>
                        )}
                      </div>
                      {!message.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      From: {message.fromUserId} • {formatDate(message.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700">{message.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-paper-plane text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sent messages</h3>
                  <p className="text-gray-600">Messages you send will appear here</p>
                </CardContent>
              </Card>
            ) : (
              sentMessages.map((message) => (
                <Card key={message.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{message.subject}</h3>
                        <Badge className={getPriorityColor(message.priority || 'normal')}>
                          {message.priority}
                        </Badge>
                        {message.messageType === 'broadcast' && (
                          <Badge variant="outline">Broadcast</Badge>
                        )}
                        {message.messageType === 'announcement' && (
                          <Badge className="bg-fc-red text-white">Announcement</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      To: {message.toUserId || 'All Users'} • {formatDate(message.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700">{message.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}