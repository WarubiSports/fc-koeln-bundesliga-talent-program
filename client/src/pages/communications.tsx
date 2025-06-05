import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Search, Phone, Video, MoreVertical, ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Conversation {
  id: string;
  type: 'team' | 'private';
  participant?: any;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  avatar?: string;
}

export default function Communications() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; conversation: Conversation }) => {
      return apiRequest("/api/messages", "POST", {
        content: data.content,
        messageType: data.conversation.type,
        recipientId: data.conversation.participant?.id?.toString(),
        recipientName: data.conversation.participant ? `${data.conversation.participant.firstName} ${data.conversation.participant.lastName}` : undefined,
        senderName: `${user?.firstName} ${user?.lastName}`,
        senderId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create conversations list
  const getConversations = (): Conversation[] => {
    const conversations: Conversation[] = [];
    
    // Add team conversation
    const teamMessages = (messages as any[]).filter(m => m.message_type === "team" || m.messageType === "team");
    const lastTeamMessage = teamMessages[0];
    
    conversations.push({
      id: "team",
      type: "team",
      name: "Team Chat",
      lastMessage: lastTeamMessage?.content || "No messages yet",
      lastMessageTime: lastTeamMessage ? new Date(lastTeamMessage.created_at || lastTeamMessage.createdAt).toLocaleTimeString() : "",
      unreadCount: 0,
      avatar: "👥"
    });

    // Add private conversations
    const privateMessages = (messages as any[]).filter(m => m.message_type === "private" || m.messageType === "private");
    const conversationMap = new Map<string, any[]>();
    
    privateMessages.forEach((message: any) => {
      const otherUserId = message.from_user_id === user?.id ? message.to_user_id : message.from_user_id;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, []);
      }
      conversationMap.get(otherUserId)?.push(message);
    });

    conversationMap.forEach((msgs, userId) => {
      const player = (players as any[]).find(p => p.id.toString() === userId);
      if (player) {
        const lastMessage = msgs[0];
        conversations.push({
          id: `private-${userId}`,
          type: "private",
          participant: player,
          name: `${player.firstName} ${player.lastName}`,
          lastMessage: lastMessage?.content || "",
          lastMessageTime: lastMessage ? new Date(lastMessage.created_at || lastMessage.createdAt).toLocaleTimeString() : "",
          unreadCount: 0,
          avatar: player.firstName?.charAt(0) || "U"
        });
      }
    });

    return conversations.filter(c => 
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const startNewChat = (player: any) => {
    const conversation: Conversation = {
      id: `private-${player.id}`,
      type: "private",
      participant: player,
      name: `${player.firstName} ${player.lastName}`,
      lastMessage: "",
      lastMessageTime: "",
      unreadCount: 0,
      avatar: player.firstName?.charAt(0) || "U"
    };
    setSelectedConversation(conversation);
    setShowConversationList(false);
  };

  const getConversationMessages = () => {
    if (!selectedConversation) return [];
    
    if (selectedConversation.type === "team") {
      return (messages as any[])
        .filter(m => m.message_type === "team" || m.messageType === "team")
        .reverse();
    } else {
      const participantId = selectedConversation.participant?.id?.toString();
      return (messages as any[])
        .filter((m: any) => {
          const isPrivate = m.message_type === "private" || m.messageType === "private";
          const fromParticipant = m.from_user_id === participantId && m.to_user_id === user?.id;
          const toParticipant = m.from_user_id === user?.id && m.to_user_id === participantId;
          return isPrivate && (fromParticipant || toParticipant);
        })
        .reverse();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      conversation: selectedConversation
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const conversations = getConversations();
  const conversationMessages = getConversationMessages();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversation List - Mobile responsive */}
      <div className={`${showConversationList ? 'block' : 'hidden'} lg:block w-full lg:w-1/3 bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                setShowConversationList(false);
              }}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {conversation.avatar}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {conversation.lastMessage}
                </p>
              </div>
              
              {conversation.unreadCount > 0 && (
                <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          ))}

          {/* New Chat Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Start New Chat</h3>
            {(players as any[]).map((player: any) => (
              <div
                key={player.id}
                onClick={() => startNewChat(player)}
                className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                  {player.firstName?.charAt(0) || "U"}
                </div>
                <div>
                  <span className="text-sm font-medium">{player.firstName} {player.lastName}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {player.position}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showConversationList ? 'block' : 'hidden'} lg:block flex-1 flex flex-col bg-white`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden mr-2"
                  onClick={() => setShowConversationList(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {selectedConversation.avatar}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === "team" ? "Team conversation" : "Private chat"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedConversation.type === "private" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {conversationMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedConversation.type === "team" 
                      ? "No team messages yet. Start the conversation!"
                      : `Start your private conversation with ${selectedConversation.name}`
                    }
                  </p>
                </div>
              ) : (
                conversationMessages.map((message: any) => {
                  const isFromMe = message.from_user_id === user?.id || message.senderId === user?.id;
                  const senderName = message.subject || message.senderName || "Unknown";
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                        {selectedConversation.type === "team" && !isFromMe && (
                          <div className="text-xs text-gray-500 mb-1 px-1">
                            {senderName}
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl ${
                            isFromMe
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-white border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-xs mt-1 ${isFromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(message.created_at || message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12 rounded-full border-gray-300 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="rounded-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Team Communications</h3>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}