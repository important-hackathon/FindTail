'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  activeConversationId: string | null;
  onSelectConversation: (userId: string, name: string) => void;
}

export default function MessageList({ activeConversationId, onSelectConversation }: MessageListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('messages-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => {
          fetchConversations();
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);
  
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get all users the current user has exchanged messages with
      const { data, error } = await supabase
        .rpc('get_conversations', { current_user_id: user.id });
        
      if (error) throw error;
      
      // Get profile info for each person in conversations
      const profiles = await Promise.all(
        data.map(async (conv: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              user_type,
              shelter_details(shelter_name)
            `)
            .eq('id', conv.other_user_id)
            .single();
            
          return {
            ...conv,
            profile: profileData,
            display_name: profileData.user_type === 'shelter' 
              ? profileData.shelter_details.shelter_name 
              : profileData.full_name
          };
        })
      );
      
      setConversations(profiles);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 text-center">No messages yet.</p>
        <p className="text-gray-500 text-center mt-2">
          Your conversations will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <div 
            key={conversation.other_user_id}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              activeConversationId === conversation.other_user_id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectConversation(conversation.other_user_id, conversation.display_name)}
          >
            <div className="flex justify-between items-start">
              <div className="font-medium">{conversation.display_name}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
              </div>
            </div>
            <div className="text-sm text-gray-600 truncate mt-1">
              {conversation.last_message}
            </div>
            {conversation.unread_count > 0 && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {conversation.unread_count} new
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
