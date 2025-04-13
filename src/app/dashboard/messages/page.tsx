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
  }>({ id: null, name: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const handleSelectConversation = (userId: string, name: string) => {
    setActiveConversation({ id: userId, name });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-[#FDF5EB]">
          <p className="text-gray-500">Завантаження...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#FDF5EB] px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2E1D0A] mb-6 text-center md:text-left">
            Повідомлення
          </h1>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-[#E2E8F0] h-[80vh] flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200">
              <MessageList
                  activeConversationId={activeConversation.id}
                  onSelectConversation={handleSelectConversation}
              />
            </div>

            <div className="w-full md:w-2/3 flex-1 bg-[#FDF5EB]">
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
