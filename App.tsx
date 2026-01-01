
import React, { useState, useEffect } from 'react';
import { COLORS, CATEGORIES, getIcon, SHARE_CATEGORIES, LEGAL_TEXTS } from './constants';
import { UserProfile, Category, SocialPost, DaysMatterEvent, ChatMessage } from './types';
import CategoryCard from './components/CategoryCard';
import AssistantModal from './components/AssistantModal';
import SocialEditorModal from './components/SocialEditorModal';
import ProfileForm from './components/ProfileForm';
import DaysMatterModal from './components/DaysMatterModal';
import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';
import { 
  Heart, Home, User as UserIcon, Plus, BookOpen, MessageSquare, ChevronRight,
  Search, Settings, Waves, Trash2, ArrowLeft, Sparkles, Info, Calendar,
  Shield, AlertTriangle, LogOut, X, Loader2, Share2, MoreHorizontal,
  Star, Bookmark, ChevronDown, Clock, MessageCircle, Heart as HeartIcon,
  Bookmark as BookmarkIcon, Send as SendIcon, Eye, ArrowUpRight, Flame,
  Briefcase, Activity, Book, Bot, Sparkle
} from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: '小青友', age: 35, gender: 'FEMALE', cancerType: '乳腺癌',
  treatmentType: ['化疗'], treatmentStatus: 'TREATMENT',
  treatmentStartDate: '2024-11-20', currentCycle: 2, partnerStatus: '已婚',
  fertilityConcerns: true, height: 165, weight: 55, nutritionStatus: '良好'
};

const INITIAL_ARTICLES = [
  { 
    id: 'a1', category_id: 'body-image', tag: '权威医学建议', title: '肤色之变：化疗色素沉着的预防与修复', 
    icon: 'user', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800', 
    content: `## 【核心结论】\n部分化疗药会导致肤色变暗 or 指关节发黑，这是药物累积的正常生理反应。通过“高频补水”与“温和美白”，可加速代谢更新。\n\n## 【深度解析】\n### 1. 为什么会变黑？\n如氟尿嘧啶等药物会刺激黑色素细胞活性。停药后3-6个月通常会自然淡化。\n\n### 2. 修护实操\n使用含烟酰胺或VC衍生物的温和身体乳。避免使用强效去角质产品，此时皮肤屏障极其脆弱。\n\n## 【温情寄语】\n暗沉只是暂时的“阴天”，那是身体在替你抵挡风暴，阳光终会再次穿透云层。`
  },
  { 
    id: 'a2', category_id: 'body-image', tag: '生活美学', title: '百变之美：医学级假发挑选与舒适佩戴全攻略', 
    icon: 'star', image_url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=800', 
    content: `## 【核心结论】\n假发不仅是掩饰，更是重塑自信的配饰。选择“真发手工钩织”与“内网抗菌”是舒适度的关键。\n\n## 【深度解析】\n### 1. 材质对比\n- 化纤丝：定型好，价格优，但易产生静电，透气性稍差。\n- 真发丝：质感自然，可二次修剪，由于是蛋白质材质，透气性最佳。\n\n### 2. 佩戴细节\n夏季可配合冰丝发网，防止头皮过热产生湿疹。每天佩戴不宜超过8小时。\n\n## 【温情寄语】\n换个发型，换种心情。即便在康复期，你依然拥有定义自己美丽的权利。`
  }
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'know' | 'talk' | 'self'>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDaysMatterOpen, setIsDaysMatterOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<any[]>(INITIAL_ARTICLES);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [shareCategory, setShareCategory] = useState('all');
  const [knowCategory, setKnowCategory] = useState('all');
  const [daysMatterEvents, setDaysMatterEvents] = useState<DaysMatterEvent[]>([]);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [legalView, setLegalView] = useState<'PRIVACY' | 'RISK' | null>(null);

  // Fix: Defined filteredPosts to filter social posts based on the selected category tag
  const filteredPosts = posts.filter(post => 
    shareCategory === 'all' || (post.tags && post.tags.includes(shareCategory))
  );

  const fetchData = async () => {
    try {
      const { data: postsData } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
      if (postsData) setPosts(postsData.map(p => ({ ...p, fullBody: p.full_body })));
      
      const { data: articlesData } = await supabase.from('knowledge_articles').select('*').order('created_at', { ascending: false });
      if (articlesData && articlesData.length > 0) {
        setKnowledgeArticles(articlesData);
      }
    } catch (err) {
      console.error("Fetch data failed:", err);
    }
  };

  const loadLocalData = (uid: string) => {
    const savedProfile = localStorage.getItem(`user_profile_${uid}`);
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    const savedDays = localStorage.getItem(`days_matter_${uid}`);
    if (savedDays) setDaysMatterEvents(JSON.parse(savedDays));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
        loadLocalData(session.user.id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
        loadLocalData(session.user.id);
      }
    });

    const knowledgeChannel = supabase.channel('knowledge-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_articles' }, () => fetchData()).subscribe();
    const postsChannel = supabase.channel('posts-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => fetchData()).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(knowledgeChannel);
      supabase.removeChannel(postsChannel);
    };
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem(`user_profile_${session.user.id}`, JSON.stringify(userProfile));
      localStorage.setItem(`days_matter_${session.user.id}`, JSON.stringify(daysMatterEvents));
    }
  }, [userProfile, daysMatterEvents, session]);

  const calculateDays = (event: DaysMatterEvent) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(event.startDate);
    start.setHours(0,0,0,0);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    if (event.type === 'COUNT_DOWN' && event.targetDate) {
      const target = new Date(event.targetDate);
      const rem = Math.floor((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return { val: Math.max(0, rem), label: '天剩余' };
    }
    if (event.type === 'CYCLE' && event.cycleDays) {
        const dayInCycle = (Math.abs(diff) % event.cycleDays) + 1;
        return { val: dayInCycle, label: '天进行中' };
    }
    return { val: Math.abs(diff), label: '天已过' };
  };

  const renderStructuredContent = (content: string) => {
    if (!content) return null;
    
    // 1. 深度清洗：移除所有加粗符号、多余空行、以及行内残留的 Markdown 标记
    const cleanContent = content
      .replace(/\\n/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗 **
      .replace(/__(.*?)__/g, '$1')      // 移除加粗 __
      .trim();
    
    // 2. 按标题切割 (## 或 ###)
    const segments = cleanContent.split(/(?=^#{2,3}\s*)/m);

    return segments.map((segment, index) => {
      const trimmed = segment.trim();
      if (!trimmed) return null;

      // 3. 匹配标题行 (去除起始的 ## 或 ###, 以及可选的 【】)
      const headerMatch = trimmed.match(/^#{2,3}\s*(?:【)?(.*?)(?:】)?(?:\s|\n|$)/);
      
      if (headerMatch) {
        const title = headerMatch[1].trim();
        const bodyText = trimmed.replace(/^#{2,3}\s*.*(?:\s|\n|$)/, '').trim();
        
        return (
          <div key={index} className="mb-8 last:mb-0">
            <div className="inline-block px-4 py-1.5 rounded-xl bg-celadon-50 text-celadon-900 font-black text-sm mb-4 border border-celadon-100/50">
              {title}
            </div>
            <div className="text-slate-600 leading-loose space-y-4">
              {bodyText.split('\n').filter(p => p.trim()).map((paragraph, pIdx) => {
                // 4. 清理段落内的 Markdown 列表符和子标题符
                const cleanPara = paragraph.trim()
                  .replace(/^[-*+]\s+/, '') // 无序列表
                  .replace(/^\d+\.\s+/, '') // 有序列表
                  .replace(/^#{1,6}\s+/, ''); // 误写的标题符
                
                return <p key={pIdx} className="text-[15px] font-medium">{cleanPara}</p>;
              })}
            </div>
          </div>
        );
      }

      // 5. 无标题的常规块处理
      return (
        <div key={index} className="mb-6 last:mb-0 text-slate-600 leading-loose text-[15px] font-medium space-y-3">
          {trimmed.split('\n').filter(l => l.trim()).map((line, lIdx) => (
            <p key={lIdx}>
              {line.trim()
                .replace(/^[-*+]\s+/, '')
                .replace(/^\d+\.\s+/, '')
                .replace(/^#{1,6}\s+/, '')
              }
            </p>
          ))}
        </div>
      );
    });
  };

  const renderCategoryDetail = () => {
    if (!activeCategory) return null;
    const categoryArticles = knowledgeArticles.filter(art => art.category_id === activeCategory.id);
    const gridTopics = {
      'body-image': ['脱发管理', '皮肤护理', '社交自信', '整形修复'],
      'work-life': ['重疾理赔', '经济援助', '返工方案', '劳动权益'],
      'exercise': ['化疗运动', '疲乏管理', '长期计划', '水肿预防'],
      'intimacy': ['安全边界', '伴侣沟通', '心理支持', '怀孕与避孕']
    }[activeCategory.id] || activeCategory.subtopics;

    return (
      <div className="fixed inset-0 z-[100] max-w-md mx-auto bg-moonWhite flex flex-col animate-in slide-in-from-right duration-300 border-x border-slate-100 shadow-2xl overflow-hidden">
        <header className="px-6 py-5 flex items-center border-b sticky top-0 bg-white z-20 shadow-sm">
          <button onClick={() => setActiveCategory(null)} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>
          <h2 className="flex-1 text-center font-black text-slate-800 mr-8 truncate px-4">{activeCategory.title}</h2>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-10 bg-crackle">
          <div className="p-6 space-y-8">
            <section className="bg-white p-7 rounded-[2.5rem] shadow-card crackle-border space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-3xl bg-celadon-50 flex items-center justify-center text-celadon-900 shadow-inner">{getIcon(activeCategory.icon, "w-10 h-10")}</div>
                <div className="flex-1 pt-1"><p className="text-[14px] text-slate-500 leading-relaxed font-medium">{activeCategory.description}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gridTopics.map((topic, i) => (
                  <button key={i} className="flex items-center gap-2.5 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-celadon-200 transition-all active:scale-95 group">
                    <div className="w-2 h-2 rounded-full bg-celadon-400 group-hover:bg-celadon-600 transition-colors" /><span className="text-[13px] font-black text-slate-700">{topic}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="space-y-5">
              <div className="flex items-center gap-2 px-2"><BookOpen className="w-5 h-5 text-celadon-600" /><h3 className="text-[15px] font-black text-slate-800 tracking-tight">指南与实践</h3></div>
              <div className="space-y-4">
                {categoryArticles.length > 0 ? categoryArticles.map((art, idx) => (
                  <div key={art.id} onClick={() => setSelectedArticle(art)} className="bg-white p-5 rounded-[1.8rem] shadow-card flex items-center gap-4 card-glaze active:scale-[0.98] transition-all cursor-pointer group border border-transparent hover:border-celadon-100">
                    <div className="w-12 h-12 rounded-full bg-celadon-50 flex items-center justify-center flex-shrink-0 text-celadon-600 group-hover:bg-celadon-100 transition-colors">{getIcon(art.icon || 'file', "w-5 h-5")}</div>
                    <div className="flex-1"><h4 className="font-black text-slate-800 text-[14px] group-hover:text-celadon-900 transition-colors line-clamp-1">{art.title}</h4><p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{art.tag || '权威医学建议'} · 3280 阅览</p></div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-celadon-300 transition-all" />
                  </div>
                )) : (<div className="text-center py-10 opacity-30 italic text-sm">暂无相关实践指南</div>)}
              </div>
            </section>
            <section className="bg-celadon-900 rounded-[2.5rem] p-8 text-white shadow-glaze relative overflow-hidden group">
              <div className="absolute inset-0 bg-crackle opacity-10"></div>
              <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 20C10 10 20 10 30 20C40 30 50 30 60 20C70 10 80 10 90 20" stroke="currentColor" strokeWidth="2" /><path d="M0 30C10 20 20 20 30 30C40 40 50 40 60 30C70 20 80 20 90 30" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                </svg>
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3"><Sparkle className="w-6 h-6 text-celadon-200 animate-pulse" /><h4 className="text-xl font-black tracking-tight">遇到困惑?</h4></div>
                <p className="text-[13px] text-celadon-50/70 leading-relaxed font-medium pr-10">关于“{activeCategory.title}”，您可以随时询问 AI 小青，获取针对您个人情况的私密建议。</p>
                <button onClick={() => setIsAssistantOpen(true)} className="bg-white text-celadon-900 px-7 py-3 rounded-full text-sm font-black shadow-lg active:scale-95 transition-all hover:bg-celadon-50">立即发起咨询</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  };

  const renderDaysMatterHomeCard = () => {
    if (daysMatterEvents.length === 0) return (
        <div onClick={() => setIsDaysMatterOpen(true)} className="w-full bg-celadon-900 rounded-[2.5rem] p-7 shadow-glaze flex items-center justify-between text-white overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer group">
          <div className="absolute inset-0 bg-crackle opacity-10"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"><Calendar className="w-8 h-8" /></div>
            <div><h4 className="font-black text-xl tracking-tight leading-tight mb-1">Days Matter</h4><p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">记录值得纪念的每一个瞬间</p></div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
        </div>
    );
    const chunkedEvents = [];
    for (let i = 0; i < daysMatterEvents.length; i += 2) { chunkedEvents.push(daysMatterEvents.slice(i, i + 2)); }
    return (
      <div className="w-full relative group">
        <div className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar gap-4 px-1 pb-1">
          {chunkedEvents.map((chunk, idx) => (
            <div key={idx} className="flex-shrink-0 w-full snap-start space-y-3">
              {chunk.map(event => {
                const { val, label } = calculateDays(event);
                return (
                  <div key={event.id} onClick={() => setIsDaysMatterOpen(true)} className="w-full bg-celadon-900 rounded-[2rem] p-5 shadow-glaze flex items-center justify-between text-white overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer group">
                    <div className="absolute inset-0 bg-crackle opacity-10"></div>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-md border border-white/10 group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5 text-white" /></div>
                      <div className="flex flex-col"><h4 className="font-black text-sm tracking-tight leading-tight mb-1 truncate max-w-[150px]">{event.title}</h4><div className="flex items-baseline gap-1.5"><span className="text-xl font-black tracking-tighter">{val}</span><span className="text-[9px] font-bold opacity-70 uppercase tracking-widest leading-none">{label}</span></div></div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {chunkedEvents.length > 1 && <div className="flex justify-center gap-1.5 mt-3">{chunkedEvents.map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-celadon-900/20" />)}</div>}
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><Loader2 className="w-8 h-8 animate-spin text-celadon" /></div>;
  if (!session) return <Auth />;

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col relative overflow-hidden bg-moonWhite font-sans bg-crackle shadow-inner border-x border-slate-100">
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-celadon shadow-sm border border-celadon-100"><Heart className="w-5 h-5 fill-white" /></div>
          <h1 className="text-xl font-bold text-deepForest tracking-tight">小青卡</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
        {activeTab === 'home' && (
          <div className="p-5 space-y-6">
            <div className="rounded-[2.5rem] p-8 text-white shadow-glaze crackle-border relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.celadon}, ${COLORS.deepForest})` }}>
              <div className="absolute inset-0 bg-crackle opacity-10"></div>
              <div className="flex gap-4 items-start relative z-10"><div className="flex-1"><p className="text-sm opacity-80 font-medium italic">早安，{userProfile.name}</p><p className="text-2xl font-black mt-1 tracking-tight">记录当下的每一份力量</p></div></div>
              <div className="mt-8 flex justify-between items-end relative z-10">
                <div className="text-[10px] font-bold opacity-90 uppercase tracking-widest">{userProfile.cancerType} · {userProfile.treatmentStatus === 'TREATMENT' ? '治疗中' : '康复期'}</div>
                <div className="bg-white/20 px-5 py-2 rounded-full text-xs font-bold backdrop-blur-md">第 {userProfile.currentCycle} 周期</div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2"><h3 className="font-black text-slate-800 text-[10px] uppercase opacity-40 tracking-[0.2em]">时光看板 Days Matter</h3>{daysMatterEvents.length > 2 && <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">左右滑动</span>}</div>
               {renderDaysMatterHomeCard()}
            </div>
            <div className="grid grid-cols-1 gap-5">
              <h3 className="font-black text-slate-800 flex items-center gap-2 px-2 text-[10px] uppercase opacity-40 tracking-[0.2em]">核心生活质量管理</h3>
              {CATEGORIES.map(cat => <CategoryCard key={cat.id} category={cat} onClick={(id) => setActiveCategory(CATEGORIES.find(c => c.id === id) || null)} />)}
            </div>
          </div>
        )}

        {activeTab === 'know' && (
          <div className="flex flex-col h-full bg-moonWhite">
            <div className="px-5 pt-7 pb-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">吾知百科</h2>
              <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1">
                <button onClick={() => setKnowCategory('all')} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${knowCategory === 'all' ? 'bg-celadon-900 text-white shadow-glaze' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>全部</button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setKnowCategory(cat.id)} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${knowCategory === cat.id ? 'bg-celadon-900 text-white border-celadon-900 shadow-glaze' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>{cat.title.split('与')[0]}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {knowledgeArticles.filter(a => knowCategory === 'all' || a.category_id === knowCategory).map(art => (
                <div key={art.id} onClick={() => setSelectedArticle(art)} className="bg-white p-4 rounded-3xl shadow-card flex items-center gap-4 card-glaze active:scale-[0.98] transition-all cursor-pointer group border border-transparent hover:border-celadon-100">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                    <img 
                      src={art.image_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' }}
                    />
                  </div>
                  <div className="flex-1"><span className="text-[9px] font-black text-celadon-600 bg-celadon-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{art.tag}</span><h4 className="font-bold text-slate-800 mt-1 line-clamp-2 leading-tight group-hover:text-celadon-900">{art.title}</h4></div>
                  <ArrowUpRight className="w-4 h-4 text-slate-200" />
                </div>
              ))}
              <div className="h-24"></div>
            </div>
          </div>
        )}

        {activeTab === 'talk' && (
          <div className="p-0">
             <div className="px-6 pt-7 pb-4 flex justify-between items-end"><div><h2 className="text-2xl font-black text-slate-800 tracking-tight">吾享社区</h2><p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-60">Community Sharing</p></div><Sparkles className="w-8 h-8 text-slate-200" /></div>
            <div className="px-6 flex gap-2 overflow-x-auto no-scrollbar py-2">
              {SHARE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setShareCategory(cat.id)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-black transition-all border ${shareCategory === cat.id ? 'bg-celadon-900 text-white border-celadon-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>{cat.emoji} {cat.title}</button>
              ))}
            </div>
            <div className="px-4 columns-2 gap-4 space-y-4 pb-20 mt-4">
                {filteredPosts.map(post => (
                  <div key={post.id} onClick={() => setSelectedPost(post)} className="break-inside-avoid bg-white rounded-[1.8rem] overflow-hidden shadow-card crackle-border flex flex-col cursor-pointer group card-glaze active:scale-[0.97] transition-all">
                    <div className="w-full aspect-square flex items-center justify-center bg-slate-50 relative overflow-hidden">{post.image_url ? <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <span className="text-6xl group-hover:scale-125 transition-transform duration-700">{post.coverEmoji || '🌿'}</span>}</div>
                    <div className="p-4 space-y-2"><p className="text-[13px] leading-relaxed text-slate-800 font-bold line-clamp-2">{post.content}</p><div className="flex items-center justify-between opacity-60"><span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">{post.author}</span><div className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" /><span className="text-[10px] font-bold">{post.likes}</span></div></div></div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'self' && (
          <div className="p-6 space-y-6 pb-20">
            {isProfileEditorOpen ? <ProfileForm initialProfile={userProfile} onSave={(p) => { setUserProfile(p); setIsProfileEditorOpen(false); }} onCancel={() => setIsProfileEditorOpen(false)} /> : (
              <>
                <div className="bg-white p-7 rounded-[2.5rem] shadow-card crackle-border flex items-center justify-between card-glaze">
                  <div className="flex items-center gap-5"><div className="w-16 h-16 rounded-full bg-celadon-50 flex items-center justify-center text-3xl border border-celadon-100 overflow-hidden relative shadow-inner"><div className="absolute inset-0 bg-crackle opacity-10"></div><span>🌿</span></div><div><h3 className="font-black text-slate-800 text-xl tracking-tight">{userProfile.name}</h3><p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{userProfile.cancerType} · 治疗阶段</p></div></div>
                  <button onClick={() => setIsProfileEditorOpen(true)} className="p-3.5 bg-slate-50 rounded-2xl text-slate-300 hover:text-celadon-900 transition-colors shadow-sm"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[ {label:'身高', val: userProfile.height, unit:'cm'}, {label:'体重', val: userProfile.weight, unit:'kg'}, {label:'营养', val: userProfile.nutritionStatus, unit:''} ].map((s, i) => (
                    <div key={i} className="bg-white py-6 rounded-[2rem] shadow-card crackle-border card-glaze text-center"><div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">{s.label}</div><div className="text-xl font-black text-slate-800">{s.val || '--'}<span className="text-[10px] ml-0.5 opacity-30">{s.unit}</span></div></div>
                  ))}
                </div>
                <div className="space-y-4 pt-2">
                   <h3 className="font-black text-slate-800 flex items-center gap-2 px-2 text-[10px] uppercase opacity-40 tracking-[0.2em]">时光管理</h3>
                   <div onClick={() => setIsDaysMatterOpen(true)} className="bg-white px-7 py-5 rounded-[2rem] shadow-card crackle-border flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                     <div className="flex items-center gap-4"><Calendar className="w-5 h-5 text-celadon-900" /><span className="font-bold text-slate-700">Days Matter 管理</span></div>
                     <div className="flex items-center gap-2"><span className="text-[11px] text-slate-300 font-bold">{daysMatterEvents.length} 个里程碑</span><ChevronRight className="w-4 h-4 text-slate-200" /></div>
                   </div>
                </div>
                <div className="space-y-4 pt-2">
                   <h3 className="font-black text-slate-800 flex items-center gap-2 px-2 text-[10px] uppercase opacity-40 tracking-[0.2em]">支持与条款</h3>
                   <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-card crackle-border">
                      {[ {Icon: Shield, text:'隐私条款', action:()=>setLegalView('PRIVACY')}, {Icon: AlertTriangle, text:'风险提示', action:()=>setLegalView('RISK')}, {Icon: LogOut, text:'退出登录', action:()=>supabase.auth.signOut(), color:'text-rose-500'} ].map((item, i) => (
                        <button key={i} onClick={item.action} className={`w-full px-7 py-5 flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all ${item.color || 'text-slate-700'}`}>
                          <div className="flex gap-4 font-bold items-center"><item.Icon className="w-5 h-5 opacity-60" /> {item.text}</div><ChevronRight className="w-4 h-4 text-slate-200" />
                        </button>
                      ))}
                   </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <nav className="bg-qinghua flex justify-around items-center h-20 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100/50 px-2">
        <button onClick={() => { setActiveTab('home'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1 w-1/5 transition-all ${activeTab === 'home' ? 'text-celadon-900 scale-105 font-black' : 'text-slate-300'}`}><Home className="w-6 h-6" /><span className="text-[10px] font-bold">首页</span></button>
        <button onClick={() => { setActiveTab('know'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1 w-1/5 transition-all ${activeTab === 'know' ? 'text-celadon-900 scale-105 font-black' : 'text-slate-300'}`}><BookOpen className="w-6 h-6" /><span className="text-[10px] font-bold">吾知</span></button>
        <div className="w-1/5 flex justify-center -mt-10 relative h-full items-start">
           <button onClick={() => setIsAssistantOpen(true)} className="w-18 h-18 rounded-full bg-celadon-900 shadow-ai-float flex items-center justify-center border-4 border-white active:scale-95 transition-all group animate-float"><Bot className="w-10 h-10 text-white group-hover:rotate-12 transition-transform drop-shadow-md" /><div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div></button>
           <span className="absolute bottom-2 text-[10px] font-bold text-celadon-900 opacity-60">小青助手</span>
        </div>
        <button onClick={() => { setActiveTab('talk'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1 w-1/5 transition-all ${activeTab === 'talk' ? 'text-celadon-900 scale-105 font-black' : 'text-slate-300'}`}><MessageSquare className="w-6 h-6" /><span className="text-[10px] font-bold">吾享</span></button>
        <button onClick={() => { setActiveTab('self'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1 w-1/5 transition-all ${activeTab === 'self' ? 'text-celadon-900 scale-105 font-black' : 'text-slate-300'}`}><UserIcon className="w-6 h-6" /><span className="text-[10px] font-bold">吾身</span></button>
      </nav>

      {renderCategoryDetail()}
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} userProfile={userProfile} />
      <SocialEditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={() => fetchData()} />
      <DaysMatterModal isOpen={isDaysMatterOpen} onClose={() => setIsDaysMatterOpen(false)} events={daysMatterEvents} onUpdate={setDaysMatterEvents} />
      
      {selectedArticle && (
        <div className="fixed inset-0 z-[150] max-w-md mx-auto bg-white flex flex-col animate-in slide-in-from-right duration-300 border-x border-slate-100 shadow-2xl">
          <header className="px-6 py-4 flex items-center border-b sticky top-0 bg-white z-20 shadow-sm">
            <button onClick={() => setSelectedArticle(null)} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="flex-1 text-center font-black text-slate-800 mr-8 truncate px-4">{selectedArticle.title}</h2>
          </header>
          <main className="flex-1 overflow-y-auto no-scrollbar p-7 space-y-8 bg-moonWhite bg-crackle">
             <div className="w-full h-56 rounded-[2.5rem] overflow-hidden shadow-card border-4 border-white bg-slate-50">
               <img 
                 src={selectedArticle.image_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800'} 
                 className="w-full h-full object-cover" 
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' }}
               />
             </div>
             <div className="bg-white p-7 rounded-[2.5rem] shadow-card crackle-border space-y-6">
                <div className="px-4 py-1.5 bg-celadon-50 text-celadon-900 rounded-full text-[11px] font-black inline-block uppercase tracking-widest">{selectedArticle.tag}</div>
                <div className="space-y-2">{renderStructuredContent(selectedArticle.content)}</div>
             </div>
             <div className="h-10"></div>
          </main>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-[200] max-w-md mx-auto bg-white flex flex-col animate-in slide-in-from-bottom duration-300 border-x border-slate-100 shadow-2xl">
           <header className="px-4 py-3 flex items-center justify-between border-b"><button onClick={() => setSelectedPost(null)}><ArrowLeft className="w-6 h-6 text-slate-400" /></button><h3 className="font-black text-slate-800">动态详情</h3><Share2 className="w-5 h-5 text-slate-400" /></header>
           <main className="flex-1 overflow-y-auto p-6 space-y-4">
             <div className="w-full aspect-square bg-slate-50 rounded-[2rem] flex items-center justify-center text-9xl">{selectedPost.coverEmoji || '🌿'}</div>
             <h1 className="text-xl font-black text-slate-800">{selectedPost.content}</h1>
             <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedPost.fullBody || selectedPost.content}</p>
           </main>
        </div>
      )}
      
      {legalView && (
        <div className="fixed inset-0 z-[300] max-w-md mx-auto bg-white p-8 overflow-y-auto border-x border-slate-100 shadow-2xl">
          <button onClick={() => setLegalView(null)} className="mb-8 text-slate-400 flex items-center gap-2 font-bold hover:text-celadon-900 active:scale-95"><ArrowLeft /> 返回</button>
          <div className="prose prose-slate max-w-none"><h2 className="text-2xl font-black text-slate-800 mb-6">{legalView === 'PRIVACY' ? '隐私条款' : '风险提示'}</h2><div className="text-slate-600 leading-relaxed font-medium">{legalView === 'PRIVACY' ? LEGAL_TEXTS.PRIVACY : LEGAL_TEXTS.RISK_WARNING}</div></div>
        </div>
      )}
    </div>
  );
};

export default App;
