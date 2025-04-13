'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react'; // Import the Bell icon for notifications

interface MessageListProps {
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string, name: string, isNotification: boolean, referenceId?: string) => void;
}

export default function MessageList({ activeConversationId, onSelectConversation }: MessageListProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchConversations();

            // Set up subscription for new messages
            const messagesSubscription = supabase
                .channel('messages-channel')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`,
                }, () => {
                    console.log("New message received, refreshing conversations");
                    fetchConversations();
                })
                .subscribe();

            // Set up subscription for new notifications
            const notificationsSubscription = supabase
                .channel('notifications-channel')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                }, () => {
                    console.log("New notification received, refreshing conversations");
                    fetchConversations();
                })
                .subscribe();

            return () => {
                messagesSubscription.unsubscribe();
                notificationsSubscription.unsubscribe();
            };
        }
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            
            console.log("Fetching conversations and notifications for user:", user.id);
            
            // First, get regular conversations
            const { data: messageData, error: messageError } = await supabase.rpc(
                'get_conversations', 
                { current_user_id: user.id }
            );
            
            if (messageError) {
                console.error("Error fetching conversations:", messageError);
                throw messageError;
            }
            
            // Second, get notifications separately
            const { data: notificationData, error: notificationError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'found_animal_report')
                .order('created_at', { ascending: false });
                
            if (notificationError) {
                console.error("Error fetching notifications:", notificationError);
                throw notificationError;
            }
            
            console.log("Retrieved messages:", messageData?.length || 0);
            console.log("Retrieved notifications:", notificationData?.length || 0);
            
            // Format notifications to match conversation structure
            const formattedNotifications = notificationData.map(notification => ({
                conversation_id: `notification_${notification.id}`,
                other_user_id: '00000000-0000-0000-0000-000000000000', // System user placeholder
                display_name: "Found Pet Report",
                last_message: notification.content,
                last_message_time: notification.created_at,
                unread_count: notification.read ? 0 : 1,
                is_notification: true,
                notification_id: notification.id,
                notification_type: notification.type,
                reference_id: notification.reference_id
            }));
            
            // For regular conversations, fetch profile info
            const processedMessageData = await Promise.all(
                messageData.map(async (item: any) => {
                    try {
                        // Fetch profile for regular conversations
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select(`id, full_name, user_type, shelter_details(shelter_name)`)
                            .eq('id', item.other_user_id)
                            .single();

                        if (profileData) {
                            // Handle shelter_details which could be an array
                            let displayName = profileData.full_name;
                            
                            if (profileData.user_type === 'shelter' && profileData.shelter_details) {
                                // Check if shelter_details is an array
                                if (Array.isArray(profileData.shelter_details)) {
                                    // Use the first item if it exists
                                    displayName = profileData.shelter_details[0]?.shelter_name || displayName;
                                } else {
                                    // If it's an object, access directly
                                    displayName = (profileData.shelter_details as { shelter_name: string }).shelter_name || displayName;
                                }
                            }
                            
                            return {
                                ...item,
                                conversation_id: `chat_${item.other_user_id}`,
                                profile: profileData,
                                display_name: displayName,
                                is_notification: false
                            };
                        }
                        
                        return {
                            ...item,
                            conversation_id: `chat_${item.other_user_id}`,
                            display_name: "Unknown User",
                            is_notification: false
                        };
                    } catch (err) {
                        console.error("Error processing conversation:", err);
                        return {
                            ...item,
                            conversation_id: `chat_${item.other_user_id}`,
                            display_name: "Error Loading User",
                            is_notification: false
                        };
                    }
                })
            );
            
            // Combine and sort by time
            const allConversations = [
                ...processedMessageData,
                ...formattedNotifications
            ].sort((a, b) => 
                new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
            );
            
            console.log("Combined conversations count:", allConversations.length);
            setConversations(allConversations);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError("Failed to load conversations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read when clicked
    const handleSelectNotification = async (notification: any) => {
        if (!user) return;
        
        try {
            console.log("Selecting notification:", notification);
            
            // Extract notification ID from the conversation_id
            const notificationId = notification.notification_id || 
                notification.conversation_id.replace('notification_', '');
                
            // Log what we're working with
            console.log("Notification details:", {
                conversationId: notification.conversation_id,
                notificationId: notificationId,
                referenceId: notification.reference_id
            });
            
            // Make sure we have a valid referenceId
            if (!notification.reference_id) {
                console.warn("No referenceId in notification, fetching from database");
                
                // Try to fetch it directly
                const { data: notificationData, error } = await supabase
                    .from('notifications')
                    .select('reference_id')
                    .eq('id', notificationId)
                    .single();
                    
                if (error) {
                    console.error("Error fetching notification reference_id:", error);
                }
                    
                if (notificationData?.reference_id) {
                    console.log("Retrieved referenceId from database:", notificationData.reference_id);
                    notification.reference_id = notificationData.reference_id;
                } else {
                    console.error("Could not retrieve referenceId for notification:", notificationId);
                }
            }
            
            // Mark the notification as read
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);
                
            if (updateError) {
                console.error("Error marking notification as read:", updateError);
            }
                
            // Then call the parent's onSelectConversation
            onSelectConversation(
                notification.conversation_id, 
                notification.display_name, 
                true, 
                notification.reference_id
            );
            
            // Refresh the list to update unread counts
            fetchConversations();
        } catch (err) {
            console.error('Error handling notification selection:', err);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <p className="text-gray-500">Завантаження...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-50">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                    onClick={() => fetchConversations()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Спробувати знову
                </button>
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
                {conversations.map((conversation) => {
                    const isActive = activeConversationId === conversation.conversation_id;
                    const isNotification = conversation.is_notification;
                    
                    return (
                        <div
                            key={conversation.conversation_id}
                            className={`p-4 cursor-pointer transition-all border-b border-b-[#E0E0E0] ${
                                isActive
                                    ? 'bg-[#A9C5E2]/20 border-l-4 border-l-[#A9C5E2]'
                                    : 'hover:bg-blue-100 border-l-transparent'
                            } ${isNotification ? 'bg-yellow-50' : ''}`}
                            onClick={() => 
                                isNotification 
                                    ? handleSelectNotification(conversation) 
                                    : onSelectConversation(
                                        conversation.conversation_id, 
                                        conversation.display_name, 
                                        false
                                      )
                            }
                        >
                            <div className="flex justify-between items-center">
                                <div className="font-medium text-[#2E1D0A] flex items-center">
                                    {isNotification && (
                                        <Bell size={16} className="mr-2 text-yellow-500" />
                                    )}
                                    {conversation.display_name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(conversation.last_message_time), {addSuffix: true})}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 truncate mt-1">{conversation.last_message}</div>
                            {conversation.unread_count > 0 && (
                                <div className="mt-2">
                                    <span className="inline-block bg-[#A9C5E2] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                      {isNotification ? 'Нове повідомлення' : `${conversation.unread_count} нових`}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}