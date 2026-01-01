
import React, { useState, useEffect } from 'react';
import { COLORS, CATEGORIES, getIcon, MOCK_ARTICLES, MOCK_POSTS, CATEGORY_ARTICLES, LEGAL_TEXTS, SHARE_CATEGORIES } from './constants';
import { UserProfile, Category, SocialPost, DaysMatterEvent, DaysMatterType } from './types';
import CategoryCard from './components/CategoryCard';
import AssistantModal from './components/AssistantModal';
import SocialEditorModal from './components/SocialEditorModal';
import ProfileForm from './components/ProfileForm';
import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';
import { 
  Heart, 
  Home, 
  User as UserIcon, 
  Plus, 
  BookOpen, 
  MessageSquare, 
  ChevronRight,
  Search,
  Settings,
  Waves,
  Trash2,
  ArrowLeft,
  Sparkles,
  Info,
  Calendar,
  Shield,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  Clock,
  RotateCw,
  PlusCircle,
  X,
  Loader2,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Check,
  Star,
  Bookmark,
  Send as SendIcon,
  ChevronDown,
  Camera,
  LayoutGrid
} from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: '小青友',
  age: 35,
  gender: 'FEMALE',
  cancerType: '乳腺癌',
  treatmentType: ['化疗'],
  treatmentStatus: 'TREATMENT',
  treatmentStartDate: '2024-11-20',
  currentCycle: 2,
  partnerStatus: '已婚',
  fertilityConcerns: true,
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'know' | 'talk' | 'self'>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [shareCategory, setShareCategory] = useState('all');
  
  const [daysMatterEvents, setDaysMatterEvents] = useState<DaysMatterEvent[]>([]);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [daysMatterView, setDaysMatterView] = useState<'LIST' | 'CREATE' | null>(null);
  const [legalView, setLegalView] = useState<'PRIVACY' | 'RISK' | null>(null);

  const [newEvent, setNewEvent] = useState<Partial<DaysMatterEvent>>({
    title: '',
    type: 'COUNT_UP',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const savedProfile = localStorage.getItem(`user_profile_${session.user.id}`);
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));

      const savedPosts = localStorage.getItem('social_posts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(MOCK_POSTS);
      }

      const savedDays = localStorage.getItem(`days_matter_${session.user.id}`);
      if (savedDays) setDaysMatterEvents(JSON.parse(savedDays));
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(`user_profile_${session.user.id}`, JSON.stringify(userProfile));
    }
  }, [userProfile, session]);

  useEffect(() => {
    localStorage.setItem('social_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(`days_matter_${session.user.id}`, JSON.stringify(daysMatterEvents));
    }
  }, [daysMatterEvents, session]);

  const handleSavePost = (newPostData: Omit<SocialPost, 'id' | 'likes' | 'timestamp'>) => {
    const newPost: SocialPost = {
      ...newPostData,
      id: Date.now().toString(),
      likes: 0,
      favorites: 0,
      comments: 0,
      timestamp: Date.now(),
      isLiked: false,
      isFavorited: false,
      coverEmoji: '🌿'
    };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleFavoritePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          isFavorited: !post.isFavorited,
          favorites: post.isFavorited ? (post.favorites || 1) - 1 : (post.favorites || 0) + 1
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('确定要删除这条动态吗？')) {
      setPosts(posts.filter(p => p.id !== id));
      if (selectedPost?.id === id) setSelectedPost(null);
    }
  };

  const calculateDays = (event: DaysMatterEvent) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const diff = now.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return event.type === 'COUNT_UP' ? Math.abs(days) : 0;
  };

  const filteredPosts = shareCategory === 'all' 
    ? posts 
    : posts.filter(p => p.tags?.includes(shareCategory));

  const renderPostDetail = () => {
    if (!selectedPost) return null;
    const post = posts.find(p => p.id === selectedPost.id) || selectedPost;
    return (
      <div className="absolute inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 bg-crackle">
        <header className="px-6 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <button onClick={() => setSelectedPost(null)}><ChevronDown className="w-6 h-6 text-slate-400" /></button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{post.author[0]}</div>
             <span className="text-sm font-bold text-slate-800">{post.author}</span>
          </div>
          <button className="text-slate-400"><MoreHorizontal className="w-5 h-5" /></button>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <div className="w-full aspect-[4/5] flex items-center justify-center text-8xl bg-celadon-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-crackle opacity-30"></div>
            <span className="relative z-10 select-none animate-float">{post.coverEmoji || '🌿'}</span>
          </div>
          <div className="p-6 space-y-6 bg-white relative min-h-screen card-glaze">
            <h1 className="text-xl font-bold text-slate-900 leading-tight relative z-20">{post.content}</h1>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap font-medium relative z-20">
              {post.fullBody || post.content}
            </div>
            <div className="flex flex-wrap gap-2 pt-4 relative z-20">
              {post.tags?.map(tag => (
                <span key={tag} className="text-sm text-celadon-900 font-bold px-3 py-1 bg-celadon-50 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col relative overflow-hidden bg-moonWhite font-sans bg-crackle">
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-celadon shadow-sm">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <h1 className="text-xl font-bold text-deepForest tracking-tight">小青卡</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {activeTab === 'home' && (
          <div className="p-5 space-y-6">
            <div className="rounded-[2.5rem] p-7 text-white shadow-glaze crackle-border relative overflow-hidden bg-crackle-light" style={{ background: `linear-gradient(135deg, ${COLORS.celadon}, ${COLORS.deepForest})` }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl opacity-40" />
              <p className="text-sm opacity-80 font-medium relative z-10">你好，{userProfile.name}</p>
              <p className="text-2xl font-bold mt-1 tracking-tight relative z-10">今天感觉如何？</p>
              <div className="mt-8 flex justify-between items-end relative z-10">
                <div className="text-xs font-bold opacity-90">当前状态: {userProfile.treatmentStatus === 'TREATMENT' ? '治疗中' : '康复中'}</div>
                <div className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">周期 {userProfile.currentCycle}</div>
              </div>
            </div>

            <div onClick={() => setDaysMatterView('LIST')} className="bg-white rounded-[2rem] p-6 shadow-glaze crackle-border relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer card-glaze">
              <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="font-bold text-slate-800 flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-celadon" /> 时光看板
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
              {daysMatterEvents.length > 0 ? (
                <div className="flex items-center gap-5 relative z-10">
                  <div className="p-4 rounded-[1.2rem] bg-emerald-50 text-emerald-600"><Clock className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase">{daysMatterEvents[0].title}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black text-celadon-900 tracking-tight">{calculateDays(daysMatterEvents[0])}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase">天</span>
                    </div>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400 relative z-10">开始记录您的里程碑</p>}
            </div>

            <div className="grid grid-cols-1 gap-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 px-1 tracking-tight"><Info className="w-4 h-4 text-celadon" /> 生活质量深度管理</h3>
              {CATEGORIES.map(cat => <CategoryCard key={cat.id} category={cat} onClick={() => setActiveCategory(cat)} />)}
            </div>
          </div>
        )}

        {activeTab === 'know' && (
          <div className="p-5 space-y-6">
            <div className="relative"><Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input className="w-full bg-white border rounded-2xl py-3 pl-10 text-sm shadow-sm focus:ring-2 focus:ring-celadon outline-none transition-all" placeholder="搜索百科..." /></div>
            <div className="space-y-4">
              {MOCK_ARTICLES.map(art => (
                <div key={art.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between card-glaze crackle-border">
                  <div className="relative z-10"><span className="text-[10px] text-celadon-900 font-bold bg-celadon-50 px-2 rounded-full">{art.tag}</span><h4 className="font-medium text-gray-800 mt-1">{art.title}</h4></div>
                  <ChevronRight className="w-5 h-5 text-gray-300 relative z-10" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'talk' && (
          <div className="p-0">
            {/* 吾享社区 Header */}
            <div className="px-5 pt-6 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">吾享社区</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">分享也是一种治愈</p>
              </div>
              <div className="text-slate-200"><Sparkles className="w-6 h-6" /></div>
            </div>

            {/* 分类标签 */}
            <div className="px-3 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
              {SHARE_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setShareCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
                    shareCategory === cat.id 
                    ? 'bg-celadon-900 text-white border-celadon-900' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-celadon-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.title}
                </button>
              ))}
            </div>

            <div className="p-3">
              <div className="columns-2 gap-3 space-y-3">
                {filteredPosts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm crackle-border flex flex-col mb-3 active:scale-95 transition-all cursor-pointer group card-glaze"
                  >
                    <div className="w-full aspect-square flex items-center justify-center text-5xl relative overflow-hidden bg-celadon-50">
                      <div className="absolute inset-0 bg-crackle opacity-20"></div>
                      <span className="relative z-10 select-none group-hover:scale-125 transition-transform duration-500">{post.coverEmoji || '🌿'}</span>
                    </div>
                    <div className="p-3 space-y-2 relative z-10">
                      <p className="text-[13px] leading-[1.4] text-slate-800 font-bold line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 flex-shrink-0">{post.author[0]}</div>
                          <span className="text-[10px] text-slate-400 font-bold truncate max-w-[60px]">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-slate-300">
                          <Heart className={`w-3 h-3 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span className="text-[10px] font-bold">{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 创建分享按钮卡片 - 置于末尾 */}
                <div 
                  onClick={() => setIsEditorOpen(true)}
                  className="break-inside-avoid bg-white rounded-2xl aspect-square flex flex-col items-center justify-center border-2 border-dashed border-celadon-100 shadow-glaze active:scale-95 transition-all cursor-pointer group card-glaze"
                >
                  <div className="w-12 h-12 rounded-full bg-celadon-50 flex items-center justify-center text-celadon-900 mb-2 group-hover:scale-110 transition-transform relative z-10">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] font-black text-celadon-900 opacity-60 relative z-10">创建分享</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'self' && (
          <div className="p-5 space-y-6 pb-10">
            {isProfileEditorOpen ? (
              <ProfileForm initialProfile={userProfile} onSave={(p) => { setUserProfile(p); setIsProfileEditorOpen(false); }} onCancel={() => setIsProfileEditorOpen(false)} />
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center justify-between card-glaze crackle-border">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-celadon-50 flex items-center justify-center text-2xl shadow-inner border border-celadon-100">🍃</div>
                    <div><h3 className="font-bold text-gray-800 text-lg">{userProfile.name}</h3><p className="text-xs text-gray-400">{userProfile.cancerType}</p></div>
                  </div>
                  <button onClick={() => setIsProfileEditorOpen(true)} className="p-2 text-slate-400 hover:text-celadon relative z-10"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm crackle-border mt-6">
                  <button onClick={async () => await supabase.auth.signOut()} className="w-full p-4 flex justify-between text-rose-500 hover:bg-rose-50 transition-colors"><div className="flex gap-3"><LogOut className="w-4 h-4" />退出登录</div></button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {renderPostDetail()}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t flex justify-around items-end pb-4 pt-2 px-2 z-40 h-20 shadow-xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'home' ? 'text-celadon-900 scale-110 font-black' : 'text-slate-400'}`}><Home className="w-6 h-6" /><span className="text-[10px]">首页</span></button>
        <button onClick={() => setActiveTab('know')} className={`flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'know' ? 'text-celadon-900 scale-110 font-black' : 'text-slate-400'}`}><BookOpen className="w-6 h-6" /><span className="text-[10px]">吾知</span></button>
        <div className="relative -mb-2 px-2">
          <button onClick={() => setIsAssistantOpen(true)} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl animate-breath border-[4px] border-white active:scale-90 transition-transform overflow-hidden" style={{ background: `radial-gradient(circle at 30% 30%, #B8E3E6, #94D6DA, #2F5D62)` }}>
            <div className="absolute inset-0 bg-crackle opacity-20"></div>
            <Waves className="w-8 h-8 relative z-10" />
          </button>
          <div className="text-[10px] font-bold text-center mt-1 text-celadon-900 opacity-60">咨询</div>
        </div>
        <button onClick={() => setActiveTab('talk')} className={`flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'talk' ? 'text-celadon-900 scale-110 font-black' : 'text-slate-400'}`}><MessageSquare className="w-6 h-6" /><span className="text-[10px]">吾享</span></button>
        <button onClick={() => setActiveTab('self')} className={`flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'self' ? 'text-celadon-900 scale-110 font-black' : 'text-slate-400'}`}><UserIcon className="w-6 h-6" /><span className="text-[10px]">吾身</span></button>
      </nav>

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} userProfile={userProfile} />
      <SocialEditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSavePost} />
    </div>
  );
};

export default App;
