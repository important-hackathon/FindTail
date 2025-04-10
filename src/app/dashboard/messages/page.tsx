'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MessageList from '@/components/messages/MessageList';
import Conversation from '@/components/messages/Conversation';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState<{
    id: string | null;
    name: string;
  }>({
    id: null,
    name: '',
  });
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);
  
  const handleSelectConversation = (userId: string, name: string) => {
    setActiveConversation({
      id: userId,
      name: name,
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[600px] flex">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200">
            <MessageList 
              activeConversationId={activeConversation.id} 
              onSelectConversation={handleSelectConversation} 
            />
          </div>
          
          {/* Active Conversation */}
          <div className="w-2/3">
            <Conversation 
              recipientId={activeConversation.id || ''} 
              recipientName={activeConversation.name} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
