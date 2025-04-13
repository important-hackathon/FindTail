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
            const { data, error } = await supabase.rpc('get_conversations', { current_user_id: user.id });
            if (error) throw error;

            const profiles = await Promise.all(
                data.map(async (conv: any) => {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select(`id, full_name, user_type, shelter_details(shelter_name)`)
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
            <div className="h-full flex items-center justify-center bg-slate-50">
                <p className="text-gray-500">Завантаження...</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-sm text-gray-500 bg-slate-50">
                <p>Повідомлень поки немає.</p>
                <p className="mt-1">Тут зʼявляться ваші розмови.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-slate-50 rounded-l-2xl border-r border-[#E0E0E0]">
            <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                    <div
                        key={conversation.other_user_id}
                        className={`p-4 cursor-pointer transition-all border-b border-b-[#E0E0E0] ${
                            activeConversationId === conversation.other_user_id
                                ? 'bg-[#A9C5E2]/20 border-l-4 border-l-[#A9C5E2]'
                                : 'hover:bg-blue-100 border-l-transparent'
                        }`}


                        onClick={() => onSelectConversation(conversation.other_user_id, conversation.display_name)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-[#2E1D0A]">{conversation.display_name}</div>
                            <div className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(conversation.last_message_time), {addSuffix: true})}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 truncate mt-1">{conversation.last_message}</div>
                        {conversation.unread_count > 0 && (
                            <div className="mt-2">
            <span className="inline-block bg-[#A9C5E2] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {conversation.unread_count} нових
            </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
