
import React, { useState } from 'react';
import { X, Image as ImageIcon, Hash, Plus, Camera } from 'lucide-react';
import { SocialPost } from '../types';

interface SocialEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<SocialPost, 'id' | 'likes' | 'timestamp'>) => void;
}

const SocialEditorModal: React.FC<SocialEditorModalProps> = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['打卡', '能量']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handlePublish = () => {
    if (!content.trim()) return;
    onSave({
      author: '我',
      content,
      tags,
    });
    setContent('');
    setTags(['打卡', '能量']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onClose} className="p-2 -ml-2"><X className="w-6 h-6 text-gray-400" /></button>
        <h3 className="font-bold text-gray-900">发布动态</h3>
        <button 
          onClick={handlePublish}
          disabled={!content.trim()}
          className="bg-rose-500 text-white px-5 py-1.5 rounded-full text-sm font-bold disabled:bg-rose-200 active:scale-95 transition-all"
        >
          发布
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Media Grid - XHS Style */}
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group active:bg-slate-100 transition-colors">
            <Camera className="w-6 h-6 text-slate-300 group-hover:text-slate-400 mb-1" />
            <span className="text-[10px] text-slate-400">添加图片</span>
          </div>
          {/* Placeholders for visuals */}
          <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>
          <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <textarea 
            className="w-full h-48 text-[15px] leading-relaxed focus:outline-none resize-none placeholder:text-gray-300 font-medium"
            placeholder="填写标题和正文，让更多青友看到你的分享..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-4 bg-slate-50 px-4 py-2.5 rounded-full">
              <Hash className="w-4 h-4 text-rose-500" />
              <input 
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                placeholder="添加话题..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button onClick={handleAddTag} className="text-xs font-bold text-rose-500">添加</button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="bg-white border border-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer text-slate-300 hover:text-rose-500" onClick={() => setTags(tags.filter(t => t !== tag))} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t flex items-center justify-between text-slate-400 bg-white">
        <div className="flex gap-6">
          <ImageIcon className="w-6 h-6" />
          <Hash className="w-6 h-6" />
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase">Xiaohongshu Layout</span>
      </div>
    </div>
  );
};

export default SocialEditorModal;
