
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { getAssistantResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  category: string;
  categoryTitle: string;
  userProfile: UserProfile;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ category, categoryTitle, userProfile, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAssistantResponse(input, category, userProfile, messages);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "抱歉，我现在遇到了一些技术困难，请稍后再试。",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800">{categoryTitle}</h2>
            <p className="text-xs text-emerald-600">在线咨询助手</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌿</span>
            </div>
            <p className="text-gray-500 max-w-xs mx-auto">
              有什么我可以帮您的吗？您可以询问有关{categoryTitle}的建议。
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-white border text-gray-800 shadow-sm'
            }`}>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">权威参考来源</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded hover:bg-cyan-100 transition-colors"
                      >
                        {source.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
              <p className="text-sm text-gray-500">正在为您查询权威医学建议...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入您的问题..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          * AI 建议仅供参考，任何重大医疗决定请务必咨询您的主治医师。
        </p>
      </form>
    </div>
  );
};

export default ChatInterface;
