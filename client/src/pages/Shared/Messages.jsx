import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, Search, User, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConvs(true);
        const data = await api.getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch Messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await api.getMessages(selectedConv.id);
        setMessages(data);
        
        // Mark conversation as read when opened
        await api.markConversationAsRead(selectedConv.id).catch(err => 
          console.error('Failed to mark conversation as read', err)
        );
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [selectedConv]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;
    
    try {
      setIsSending(true);
      const newMsg = await api.sendMessage(selectedConv.id, messageText);
      setMessages([...messages, newMsg]);
      setMessageText('');
      
      // Update conversation updated_at in the sidebar
      setConversations(convs => 
        convs.map(c => 
          c.id === selectedConv.id 
            ? { ...c, updated_at: new Date().toISOString() } 
            : c
        ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Helper to get the other participant in a conversation
  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    const other = conv.participants.find(p => p.user.id !== user?.id);
    return other ? other.user : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1 text-sm">Communicate directly with your connections.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex h-full min-h-[450px]">
        
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50 ${
          selectedConv ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherUser = getOtherParticipant(conv);
                const isSelected = selectedConv?.id === conv.id;
                
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-100 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {otherUser?.profile_photo_url ? (
                        <img src={otherUser.profile_photo_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">
                        {otherUser?.full_name || 'Unknown User'}
                      </h4>
                      <p className="text-xs text-primary font-medium truncate capitalize">
                        {otherUser?.role || 'User'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className={`flex-1 flex flex-col bg-white ${
          selectedConv ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConv(null)} 
                  className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-1"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} />
                </button>

                {(() => {
                  const otherUser = getOtherParticipant(selectedConv);
                  return (
                    <>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {otherUser?.profile_photo_url ? (
                          <img src={otherUser.profile_photo_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{otherUser?.full_name || 'Unknown User'}</h3>
                        <p className="text-xs text-gray-500 capitalize">{otherUser?.role || 'User'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Chat History */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/50">
                {loadingMessages ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm text-center">No messages yet. Send a message to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-3 ${
                            isMe 
                              ? 'bg-primary text-white rounded-br-sm shadow-sm' 
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                          }`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                            <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 p-6">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-500">Your Messages</h3>
              <p className="text-sm mt-2 max-w-sm text-center">Select a conversation from the sidebar to view your message history or start a new chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
