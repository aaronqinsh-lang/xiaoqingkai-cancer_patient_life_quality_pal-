import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, Waves, Loader2, StopCircle, History, MessageSquare, Bot } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserProfile, ChatMessage } from '../types';
import { getAssistantResponse } from '../services/geminiService';

// Implementation of decode function as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

// Implementation of decodeAudioData function for raw PCM data as per guidelines
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  // Use byteOffset and byteLength to handle potential alignment issues in underlying buffer
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Implementation of encode function as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('assistant_history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('assistant_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSendText = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await getAssistantResponse(input, 'general', userProfile, messages);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: res.text, timestamp: Date.now(), sources: res.sources }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: '抱歉，我现在连接不稳定，请稍后再试。', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopVoice = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => {});
      inputAudioContextRef.current = null;
    }
    
    setIsVoiceActive(false);
    nextStartTimeRef.current = 0;
  };

  const startLiveVoice = async () => {
    setIsVoiceActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const outputContext = audioContextRef.current;
      const inputContext = inputAudioContextRef.current;

      await outputContext.resume();
      await inputContext.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              const pcmBlob = { 
                data: encode(new Uint8Array(int16.buffer)), 
                mimeType: 'audio/pcm;rate=16000' 
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), outputContext, 24000, 1);
              const source = outputContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputContext.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: (e) => {
            setIsVoiceActive(false);
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setIsVoiceActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "你是'小青卡'健康管家。用中文提供温暖、专业且结构化的建议。"
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice session:', err);
      setIsVoiceActive(false);
      stopVoice();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[92vh] animate-in slide-in-from-bottom duration-300 relative border-x border-slate-100">
        <header className="px-6 py-5 flex items-center justify-between border-b bg-white relative z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white bg-celadon shadow-sm relative overflow-hidden">
               <div className="absolute inset-0 bg-crackle opacity-20"></div>
               <Bot className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base tracking-tight leading-tight">小青助手</h3>
              <div className="flex bg-slate-50 p-0.5 rounded-full mt-1 border border-slate-100">
                <button onClick={() => { if(isVoiceActive) stopVoice(); setMode('text'); }} className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all ${mode === 'text' ? 'bg-celadon-900 text-white shadow-sm' : 'text-slate-400'}`}>文本咨询</button>
                <button onClick={() => setMode('voice')} className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all ${mode === 'voice' ? 'bg-celadon-900 text-white shadow-sm' : 'text-slate-400'}`}>实时语音</button>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-full transition-all ${showHistory ? 'bg-celadon-50 text-celadon-900' : 'text-slate-400 hover:bg-slate-50'}`}><History className="w-5 h-5" /></button>
            <button onClick={() => { if(isVoiceActive) stopVoice(); onClose(); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </header>

        <div className={`bg-slate-50 border-b overflow-hidden transition-all duration-300 ease-in-out ${showHistory ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">最近咨询记录</span>
              <button onClick={() => { setMessages([]); localStorage.removeItem('assistant_history'); }} className="text-[9px] font-bold text-rose-400 uppercase hover:text-rose-600 transition-colors">清除记录</button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-48 no-scrollbar">
              {messages.length === 0 ? <p className="text-xs text-slate-300 text-center py-4 italic">暂无咨询记录</p> : messages.filter(m => m.role === 'user').slice(-5).map((m, i) => (
                <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm hover:border-celadon-200 cursor-pointer group">
                  <MessageSquare className="w-3.5 h-3.5 text-celadon flex-shrink-0" />
                  <p className="text-xs text-slate-600 truncate font-medium flex-1">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 no-scrollbar">
          {mode === 'text' ? (
            <div ref={scrollRef} className="space-y-6 pb-4">
              {messages.length === 0 && (
                <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-50 text-2xl">🍃</div>
                  <h4 className="font-bold text-slate-800">你好呀，青友</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-[180px] mx-auto leading-relaxed">很高兴在这个时刻陪伴你。关于治疗或心情，有什么想聊聊的吗？</p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-4 duration-300`}>
                  <div className={`max-w-[88%] p-4 rounded-2xl shadow-sm relative ${msg.role === 'user' ? 'bg-celadon-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none card-glaze'}`}>
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-celadon-900" />
                    <span className="text-xs text-slate-400 font-bold">小青正在思考...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 px-8">
              <div className={`relative flex items-center justify-center w-40 h-40 rounded-full transition-all duration-700 ${isVoiceActive ? 'bg-celadon-50' : 'bg-slate-50 shadow-inner'}`}>
                {isVoiceActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-celadon-100/50 rounded-full animate-ping opacity-60" />
                    <button onClick={stopVoice} className="bg-celadon-900 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl relative z-10 active:scale-90 transition-transform">
                      <StopCircle className="w-8 h-8" />
                    </button>
                  </div>
                ) : (
                  <Mic className="w-10 h-10 text-slate-200" />
                )}
              </div>
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-lg tracking-tight">{isVoiceActive ? '正在倾听，请对我说...' : '准备好倾听您的声音'}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">开启语音树洞，我会一直在这里陪伴您。</p>
              </div>
              {!isVoiceActive && (
                <button onClick={startLiveVoice} className="bg-celadon-900 text-white px-8 py-3.5 rounded-full font-black shadow-glaze active:scale-95 transition-all flex items-center gap-3">
                  <Waves className="w-5 h-5 animate-pulse" /> 开启语音树洞
                </button>
              )}
            </div>
          )}
        </div>

        {mode === 'text' && (
          <div className="p-5 bg-white border-t relative z-20">
            <div className="flex gap-2 relative">
              <input 
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none transition-all pr-24" 
                placeholder="输入你想说的话..." 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendText()} 
              />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button 
                  onClick={() => setMode('voice')} 
                  className="p-2 text-slate-300 hover:text-celadon-900 hover:bg-celadon-50 rounded-xl transition-all active:scale-90"
                  title="切换到语音模式"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={handleSendText} 
                  disabled={!input.trim() || isLoading} 
                  className="p-2 bg-celadon-900 text-white rounded-xl disabled:bg-slate-200 transition-all active:scale-90 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-300 mt-4 uppercase tracking-[0.2em] font-black">AI Support Powered by Gemini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantModal;