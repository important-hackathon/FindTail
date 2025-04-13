'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Image from "next/image";

interface ConversationProps {
  recipientId: string;
  recipientName: string;
}

export default function Conversation({ recipientId, recipientName }: ConversationProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && recipientId) {
      fetchMessages();
      markMessagesAsRead();

      const subscription = supabase
          .channel('messages-channel')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          }, () => {
            fetchMessages();
            markMessagesAsRead();
          })
          .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!user || !recipientId) return;

    try {
      setLoading(true);
      const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !recipientId) return;

    try {
      await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', recipientId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipientId || !newMessage.trim()) return;

    try {
      setSending(true);
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: recipientId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!recipientId) {
    return (
        <div className="h-full flex items-center justify-center text-gray-500 bg-slate-50">
          Оберіть розмову для перегляду повідомлень
        </div>
    );
  }

  return (
      <div className="h-full flex flex-col rounded-r-2xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-200 bg-slate-50 relative">
          <h2 className="text-lg font-semibold text-[#2E1D0A]">{recipientName}</h2>
          <Image
              src="/assets/images/cat.png"
              alt="FindTail Logo"
              width={60}
              height={80}
              className="absolute -bottom-5 right-0 z-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
              <div className="flex justify-center text-sm text-gray-500">Завантаження повідомлень...</div>
          ) : messages.length === 0 ? (
              <div className="flex justify-center text-sm text-gray-500">Немає повідомлень.</div>
          ) : (
              messages.map((message) => {
                const isMe = message.sender_id === user?.id;
                return (
                    <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl text-sm shadow-md whitespace-pre-wrap ${
                              isMe
                                  ? 'bg-[#A9C5E2] text-white'
                                  : 'bg-gray-50 text-[#2E1D0A]'
                          }`}
                      >
                        <div>{message.content}</div>
                        <div className="text-[10px] mt-1 opacity-60 text-right">
                          {formatDistanceToNow(new Date(message.created_at), {addSuffix: true})}
                        </div>
                      </div>
                    </div>
                );
              })
          )}
          <div ref={messagesEndRef}/>
        </div>

        <div className="border-t border-gray-200 p-4 bg-slate-50">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишіть повідомлення..."
                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
            />
            <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-[#A9C5E2] hover:bg-[#90b4db] text-white px-5 py-2 rounded-full text-sm font-semibold transition"
            >
              {sending ? '...' : 'Надіслати'}
            </button>
          </form>
        </div>
      </div>

  );
}
