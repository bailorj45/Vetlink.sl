'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Badge } from '@/components/ui/Badge';
import { Send, Mic, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { sendMessage, listenToMessages, markMessagesAsRead, type Message } from '@/lib/utils/db';
import { format } from 'date-fns';

export default function MessagesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadMessages(selectedCaseId);
      setupRealtimeListener(selectedCaseId);
      
      // Mark messages as read
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          markMessagesAsRead(selectedCaseId, user.id);
        }
      });
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [selectedCaseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCases = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('cases')
        .select('*, assigned_vet:users!cases_assigned_vet_id_fkey(*)')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });

      setCases((data as any) || []);
      if (data && data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const loadMessages = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(*)')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeListener = (caseId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    channelRef.current = listenToMessages(caseId, async (message) => {
      setMessages((prev) => [...prev, message]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        markMessagesAsRead(caseId, user.id);
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCaseId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await sendMessage({
        case_id: selectedCaseId,
        sender_id: user.id,
        sender_role: 'farmer',
        content: newMessage,
        message_type: 'text',
      });

      setNewMessage('');
    } catch (error: any) {
      alert('Error sending message: ' + error.message);
    }
  };

  const handleVoiceMessage = async (transcription: string) => {
    if (!transcription.trim() || !selectedCaseId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // TODO: Upload audio file and get URL
      // For now, send as text
      await sendMessage({
        case_id: selectedCaseId,
        sender_id: user.id,
        sender_role: 'farmer',
        content: transcription,
        message_type: 'voice',
      });

      setShowVoiceRecorder(false);
    } catch (error: any) {
      alert('Error sending voice message: ' + error.message);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Cases Sidebar */}
      <div className="w-80 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Cases</h2>
        </div>
        <div className="divide-y">
          {cases.map((caseItem) => (
            <button
              key={caseItem.id}
              onClick={() => setSelectedCaseId(caseItem.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedCaseId === caseItem.id ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {caseItem.diagnosis || 'Pending Diagnosis'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {caseItem.symptom_description}
                  </p>
                  {caseItem.assigned_vet && (
                    <p className="text-xs text-primary mt-1">
                      Vet: {caseItem.assigned_vet.full_name}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    caseItem.status === 'resolved'
                      ? 'success'
                      : caseItem.status === 'assigned'
                      ? 'info'
                      : 'warning'
                  }
                  className="text-xs"
                >
                  {caseItem.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedCase ? (
          <>
            {/* Header */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">
                {selectedCase.diagnosis || 'Case Discussion'}
              </h2>
              {selectedCase.assigned_vet && (
                <p className="text-sm text-gray-600">
                  Veterinarian: {selectedCase.assigned_vet.full_name}
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isFarmer = message.sender_role === 'farmer';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-12 p-3 ${
                        isFarmer
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.message_type === 'voice' && (
                        <div className="mt-2">
                          <audio
                            src={message.audio_url}
                            controls
                            className="w-full"
                          />
                        </div>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              {showVoiceRecorder ? (
                <div className="mb-4">
                  <VoiceRecorder
                    onTranscriptionComplete={handleVoiceMessage}
                    onAIResponseComplete={() => {}}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceRecorder(false)}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowVoiceRecorder(true)}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="primary" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Select a case to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

