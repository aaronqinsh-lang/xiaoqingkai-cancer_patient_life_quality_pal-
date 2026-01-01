
import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, RotateCw, ArrowLeft, ChevronRight } from 'lucide-react';
import { DaysMatterEvent, DaysMatterType } from '../types';

interface DaysMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: DaysMatterEvent[];
  onUpdate: (events: DaysMatterEvent[]) => void;
}

const DaysMatterModal: React.FC<DaysMatterModalProps> = ({ isOpen, onClose, events, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<DaysMatterEvent>>({
    type: 'COUNT_UP',
    startDate: new Date().toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const calculateDisplay = (event: DaysMatterEvent) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (event.type === 'COUNT_UP') return { value: Math.abs(diffDays), label: '已过天数' };
    if (event.type === 'COUNT_DOWN' && event.targetDate) {
      const target = new Date(event.targetDate);
      target.setHours(0, 0, 0, 0);
      const remaining = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { value: Math.max(0, remaining), label: '剩余天数' };
    }
    if (event.type === 'CYCLE' && event.cycleDays) {
      const dayInCycle = (Math.abs(diffDays) % event.cycleDays) + 1;
      const cycleCount = Math.floor(Math.abs(diffDays) / event.cycleDays) + 1;
      return { value: dayInCycle, label: `第 ${cycleCount} 周期 · 第 ${dayInCycle} 天` };
    }
    return { value: 0, label: '--' };
  };

  const handleAdd = () => {
    if (!formData.title || !formData.startDate) return;
    const newEvent: DaysMatterEvent = {
      id: Date.now().toString(),
      title: formData.title,
      type: formData.type as DaysMatterType,
      startDate: formData.startDate,
      targetDate: formData.targetDate,
      cycleDays: formData.cycleDays,
    };
    onUpdate([...events, newEvent]);
    setIsAdding(false);
    setFormData({ type: 'COUNT_UP', startDate: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个里程碑吗？')) {
      onUpdate(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] max-w-md mx-auto bg-moonWhite flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden border-x border-slate-100 shadow-2xl">
      <header className="px-6 py-5 bg-white border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={isAdding ? () => setIsAdding(false) : onClose} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-all">
          {isAdding ? <ArrowLeft /> : <X className="w-6 h-6" />}
        </button>
        <h3 className="font-black text-slate-800 text-lg tracking-tight">Days Matter</h3>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="p-2 bg-celadon-50 rounded-full text-celadon-900 active:scale-90 transition-all">
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-crackle">
        {isAdding ? (
          <div className="bg-white p-7 rounded-[2.5rem] shadow-card crackle-border space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden card-glaze">
            <div>
              <h4 className="font-black text-slate-800 text-xl tracking-tight mb-1">新记录</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">记录抗癌路上的每一个值得</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">事件名称</label>
                <input 
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-celadon/20 transition-all placeholder:text-slate-300" 
                  placeholder="例如：手术日、完成化疗..." 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[ { id: 'COUNT_UP', label: '正数', icon: Clock }, { id: 'COUNT_DOWN', label: '倒数', icon: Calendar }, { id: 'CYCLE', label: '周期', icon: RotateCw } ].map(mode => (
                  <button 
                    key={mode.id} 
                    onClick={() => setFormData({...formData, type: mode.id as DaysMatterType})} 
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all ${formData.type === mode.id ? 'bg-celadon-900 text-white border-celadon-900 shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
                  >
                    <mode.icon className={`w-5 h-5 ${formData.type === mode.id ? 'text-white' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-black">{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">起始日期</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-celadon/20 transition-all appearance-none" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  />
                  <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {formData.type === 'COUNT_DOWN' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">目标日期</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-celadon/20 transition-all appearance-none" 
                      value={formData.targetDate || ''} 
                      onChange={e => setFormData({...formData, targetDate: e.target.value})} 
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {formData.type === 'CYCLE' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">周期天数</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-celadon/20 transition-all" 
                    placeholder="例如：21" 
                    value={formData.cycleDays || ''} 
                    onChange={e => setFormData({...formData, cycleDays: parseInt(e.target.value)})} 
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleAdd} 
              className="w-full relative group overflow-hidden rounded-full mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-celadon-900 to-deepForest transition-all group-hover:scale-110 duration-500"></div>
              <div className="relative py-4 text-white font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl">
                <span>确认并保存</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {events.length === 0 ? (
              <div className="text-center py-24 opacity-40">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 text-slate-300 shadow-sm"><Calendar className="w-7 h-7" /></div>
                <p className="text-xs font-bold uppercase tracking-widest italic">还没有里程碑，快去添加吧</p>
              </div>
            ) : events.map(event => {
              const display = calculateDisplay(event);
              return (
                <div key={event.id} className="bg-white p-6 rounded-[2.5rem] shadow-card crackle-border flex items-center justify-between card-glaze overflow-hidden relative group active:scale-[0.98] transition-all border border-transparent hover:border-celadon-100">
                  <div className="flex-1 pr-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black text-celadon-900 bg-celadon-100 px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">{event.type === 'COUNT_UP' ? '正数' : event.type === 'COUNT_DOWN' ? '倒数' : '周期'}</span>
                      <span className="text-[10px] text-slate-300 font-bold">{event.startDate}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight group-hover:text-celadon-900 transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-60 leading-none">{display.label}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 relative z-10">
                    <div className="text-4xl font-black text-celadon-900 tracking-tighter leading-none">{display.value}</div>
                    <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-100 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DaysMatterModal;
