'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { getChatCompletion } from '../lib/groq';
import { supabase } from '../lib/supabase'; // Supabase client ko link kar diya

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Salam Abdul Ahad! 🚀 Main aapka AI co-founder, Abdul's Agent, ready hu. Batao yaar, aaj kaun sa dhamakedar startup idea le kar aaye ho? Poora detail mein batao, phir hum milkar duniya hila denge! 💪",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Website khulte hi database se purani chat load karne ke liye
  useEffect(() => {
    scrollToBottom();
    
    async function loadSavedChats() {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('role, content')
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setMessages(data as Message[]);
        }
      } catch (err) {
        console.error("Purani chat load nahi ho saki:", err);
      }
    }
    
    loadSavedChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. User ka message Supabase mein daalein
      await supabase.from('chats').insert([userMessage]);

      const response = await getChatCompletion(
        messages.concat(userMessage).map(m => ({ role: m.role, content: m.content }))
      );
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // 2. AI Agent ka jawab bhi Supabase mein save karein
      await supabase.from('chats').insert([assistantMessage]);

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Oops bhai! Kuch error aa gaya. Keys sahi se set ki hain? Ya thodi der baad try karo.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Abdul's Agent</h1>
            <p className="text-xs text-gray-400">AI Co-Founder by Abdul Ahad (Supabase Connected)</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">Soch raha hoon bhai...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Abdul's Agent se kuch bhi pucho ya project idea share karo..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Groq + Llama 3.1 • Created with ❤️ by Abdul Ahad
        </p>
      </div>
    </div>
  );
}
