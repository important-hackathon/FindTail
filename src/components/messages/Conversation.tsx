'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Image from "next/image";
import { Bell } from 'lucide-react';

interface ConversationProps {
  conversationId: string;
  recipientName: string;
  isNotification: boolean;
  referenceId?: string;
}

export default function Conversation({ 
  conversationId, 
  recipientName, 
  isNotification, 
  referenceId 
}: ConversationProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [foundPetReport, setFoundPetReport] = useState<any>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch data when conversation changes
  useEffect(() => {
    if (user && conversationId) {
      if (isNotification && referenceId) {
        fetchFoundPetReport();
      } else {
        fetchMessages();
        markMessagesAsRead();
      }
    }
  }, [user, conversationId, isNotification, referenceId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, foundPetReport]);

  // Fetch regular chat messages
  const fetchMessages = async () => {
    if (!user || !conversationId || isNotification) return;

    try {
      setLoading(true);
      const otherUserId = conversationId.replace('chat_', '');
      
      const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch found pet report details
  const fetchFoundPetReport = async () => {
    if (!user || !referenceId) return;

    try {
      setLoading(true);
      
      // Get the report details
      const { data: reportData, error: reportError } = await supabase
        .from('found_animal_reports')
        .select(`
          *,
          reporter:profiles(full_name, phone_number)
        `)
        .eq('id', referenceId)
        .single();
        
      if (reportError) throw reportError;
      
      setFoundPetReport(reportData);
    } catch (err) {
      console.error('Error fetching found pet report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark regular messages as read
  const markMessagesAsRead = async () => {
    if (!user || !conversationId || isNotification) return;

    try {
      const otherUserId = conversationId.replace('chat_', '');
      
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Send a new message in regular conversation
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !conversationId || !newMessage.trim() || isNotification) return;

    try {
      setSending(true);
      const otherUserId = conversationId.replace('chat_', '');
      
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: otherUserId,
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

  // Process found pet (add to shelter)
  const handleAddToShelter = async () => {
    if (!user || !foundPetReport) return;
    
    try {
      setProcessingAction(true);
      
      // 1. Add animal to shelter's animals list
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .insert({
          name: foundPetReport.breed || getSpeciesLabel(foundPetReport.species), 
          species: foundPetReport.species,
          breed: foundPetReport.breed,
          gender: foundPetReport.gender,
          age_years: foundPetReport.age_estimate === 'puppy_kitten' || foundPetReport.age_estimate === 'young' ? 0 : 
                    foundPetReport.age_estimate === 'adult' ? 2 : 
                    foundPetReport.age_estimate === 'senior' ? 5 : 1,
          age_months: foundPetReport.age_estimate === 'puppy_kitten' ? 3 : 0,
          description: `${foundPetReport.additional_notes || ''} ${foundPetReport.health_notes ? 'Стан здоров\'я: ' + foundPetReport.health_notes : ''}`.trim(),
          health_status: foundPetReport.health_notes ? 'needs_care' : 'healthy',
          shelter_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_adopted: false
        })
        .select('id')
        .single();
        
      if (animalError) throw animalError;
      
      // 2. If there's an image, copy it to animal_images
      if (foundPetReport.image_url) {
        const { error: imageError } = await supabase
          .from('animal_images')
          .insert({
            animal_id: animalData.id,
            image_url: foundPetReport.image_url,
            is_primary: true,
            created_at: new Date().toISOString()
          });
          
        if (imageError) {
          console.error('Error copying image:', imageError);
        }
      }
      
      // 3. Update the report status to 'processed'
      const { error: updateError } = await supabase
        .from('found_animal_reports')
        .update({
          status: 'processed',
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', foundPetReport.id);
        
      if (updateError) throw updateError;
      
      // 4. Send notification to the reporter if there is one
      if (foundPetReport.reporter_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: foundPetReport.reporter_id,
            type: 'found_animal_processed',
            content: `Ваше повідомлення про знайдену тварину прийнято притулком.`,
            reference_id: foundPetReport.id,
            read: false
          });
      }
      
      setActionSuccess(true);
    } catch (err: any) {
      console.error('Error processing found animal:', err);
      alert('Error adding animal to shelter: ' + (err.message || 'Please try again.'));
    } finally {
      setProcessingAction(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function for species label
  const getSpeciesLabel = (species: string) => {
    switch(species) {
      case 'dog': return 'Собака';
      case 'cat': return 'Кіт';
      default: return 'Тварина';
    }
  };
  
  // Helper function for age label
  const getAgeLabel = (age: string) => {
    switch(age) {
      case 'puppy_kitten': return 'Цуценя/Кошеня';
      case 'young': return 'Молода';
      case 'adult': return 'Доросла';
      case 'senior': return 'Літня';
      default: return 'Невідомо';
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-slate-50">
        Оберіть розмову для перегляду повідомлень
      </div>
    );
  }

  // Render found pet notification view
  if (isNotification && referenceId) {
    return (
      <div className="h-full flex flex-col rounded-r-2xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50 flex items-center">
          <Bell className="text-yellow-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold text-[#2E1D0A]">{recipientName}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center text-sm text-gray-500">Завантаження даних...</div>
          ) : foundPetReport ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-yellow-50 text-yellow-800 border-b border-yellow-100">
                <h3 className="font-bold text-lg mb-1">Повідомлення про знайдену тварину</h3>
                <p>Надіслано: {formatDate(foundPetReport.created_at)}</p>
              </div>
              
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-1/3">
                  {foundPetReport.image_url ? (
                    <div className="relative h-64 md:h-full">
                      <img 
                        src={foundPetReport.image_url} 
                        alt={getSpeciesLabel(foundPetReport.species)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Немає фото</span>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="md:w-2/3 p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {getSpeciesLabel(foundPetReport.species)} {foundPetReport.breed ? `(${foundPetReport.breed})` : ''}
                    </h2>
                    <p className="text-gray-500">
                      Знайдено: {formatDate(foundPetReport.date_found)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500">Вік:</span> {getAgeLabel(foundPetReport.age_estimate)}
                    </div>
                    <div>
                      <span className="text-gray-500">Стать:</span> {foundPetReport.gender === 'male' ? 'Самець' : foundPetReport.gender === 'female' ? 'Самка' : 'Невідомо'}
                    </div>
                    <div>
                      <span className="text-gray-500">Колір:</span> {foundPetReport.color || 'Не вказано'}
                    </div>
                    <div>
                      <span className="text-gray-500">Місцезнаходження:</span> {foundPetReport.current_location}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-gray-500">Місце знаходження:</span> {foundPetReport.location_found}
                  </div>
                  
                  {foundPetReport.health_notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">Стан здоров'я:</h4>
                      <p className="text-gray-600">{foundPetReport.health_notes}</p>
                    </div>
                  )}
                  
                  {foundPetReport.additional_notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">Додаткові примітки:</h4>
                      <p className="text-gray-600">{foundPetReport.additional_notes}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Контактна інформація:</h4>
                    
                    <p className="text-gray-600">
                      <span className="font-medium">Повідомив:</span> {foundPetReport.reporter?.full_name || 'Анонімний користувач'}
                    </p>
                    
                    {foundPetReport.reporter?.phone_number && (
                      <p className="text-gray-600">
                        <span className="font-medium">Телефон:</span> {foundPetReport.reporter.phone_number}
                      </p>
                    )}
                    
                    {foundPetReport.contact_phone && (
                      <p className="text-gray-600">
                        <span className="font-medium">Контактний телефон:</span> {foundPetReport.contact_phone}
                      </p>
                    )}
                    
                    {foundPetReport.contact_email && (
                      <p className="text-gray-600">
                        <span className="font-medium">Контактний email:</span> {foundPetReport.contact_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {actionSuccess ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded-md">
                    <h4 className="font-bold mb-1">Тварину успішно додано до вашого притулку!</h4>
                    <p>Ви можете переглянути її в розділі "Тварини".</p>
                  </div>
                ) : foundPetReport.status === 'processed' ? (
                  <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
                    <h4 className="font-bold mb-1">Цю тварину вже було додано до притулку</h4>
                    <p>Дата обробки: {formatDate(foundPetReport.processed_at)}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToShelter}
                    disabled={processingAction}
                    className="px-4 py-2 bg-[#A9BFF2] text-white rounded-md hover:bg-[#93a9d5] disabled:opacity-50"
                  >
                    {processingAction 
                      ? 'Обробка...' 
                      : 'Додати до списку тварин притулку'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              Не вдалося завантажити дані про знайдену тварину.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular conversation view
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