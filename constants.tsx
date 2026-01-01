
import React from 'react';
import { 
  Heart, 
  User, 
  Briefcase, 
  Activity, 
  Utensils, 
  Moon, 
  Baby, 
  Home,
  BookOpen,
  MessageCircle,
  Settings,
  ShieldAlert,
  Flame,
  Stethoscope,
  Calendar,
  Clock,
  RotateCw,
  Scale,
  Ruler,
  Apple,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Category, SocialPost } from './types';

export const COLORS = {
  celadon: '#94D6DA',
  deepForest: '#2F5D62',
  moonWhite: '#F0F9F9',
  accentGreen: '#10B981',
  softGray: '#64748B'
};

export const SHARE_CATEGORIES = [
  { id: 'all', title: '全部', emoji: '🌟' },
  { id: '美食', title: '美食', emoji: '🥗' },
  { id: '美景', title: '美景', emoji: '🖼️' },
  { id: '美物', title: '美物', emoji: '🎁' },
  { id: '美文', title: '美文', emoji: '✍️' },
];

export const LEGAL_TEXTS = {
  PRIVACY: `小青卡非常重视您的隐私...`,
  RISK_WARNING: `风险提示与免责声明...`
};

export const CATEGORIES: Category[] = [
  {
    id: 'body-image',
    title: '身体形象与自我认知',
    description: '脱发管理、外观变化适应及社交自信重建。',
    icon: 'user',
    color: 'celadon',
    subtopics: ['脱发管理', '外观变化', '社交自信', '整形修复']
  },
  {
    id: 'work-life',
    title: '工作与经济管理',
    description: '化疗期间的工作能力评估、雇主沟通与返工计划。',
    icon: 'briefcase',
    color: 'celadon',
    subtopics: ['工作评估', '经济援助', '返工方案', '劳动权益']
  },
  {
    id: 'exercise',
    title: '运动与康复指导',
    description: '按治疗阶段定制的运动方案与手术后功能恢复。',
    icon: 'activity',
    color: 'celadon',
    subtopics: ['化疗运动', '术后康复', '长期计划', '水肿预防']
  },
  {
    id: 'intimacy',
    title: '两性关系与亲密生活',
    description: '性生活安全指南、功能障碍应对及伴侣沟通技巧。',
    icon: 'heart',
    color: 'celadon',
    subtopics: ['性生活安全', '功能障碍应对', '伴侣支持', '怀孕与避孕']
  }
];

export const CATEGORY_ARTICLES: Record<string, any[]> = {
  intimacy: [
    { title: '化疗期间的性生活安全边界', icon: <ShieldAlert className="text-rose-400" /> },
    { title: '伴侣沟通：如何表达你的生理需求', icon: <MessageCircle className="text-blue-400" /> },
    { title: '功能障碍：医学选项与心理调适', icon: <Flame className="text-amber-400" /> }
  ],
  'body-image': [
    { title: '脱发全周期护理方案', icon: <Moon className="text-indigo-400" /> },
    { title: '假发选择与自然佩戴指南', icon: <User className="text-cyan-400" /> },
    { title: '疤痕修复与心态重建', icon: <Activity className="text-emerald-400" /> }
  ],
  'work-life': [
    { title: '化疗阶段工作强度评估量表', icon: <Briefcase className="text-slate-400" /> },
    { title: '雇主沟通模板：如何申请弹性工时', icon: <MessageCircle className="text-blue-400" /> },
    { title: '经济补助申领指南(2025版)', icon: <BookOpen className="text-amber-400" /> }
  ],
  exercise: [
    { title: '术后手臂21天功能训练营', icon: <Activity className="text-rose-400" /> },
    { title: '淋巴水肿居家预防手册', icon: <ShieldAlert className="text-emerald-400" /> },
    { title: '有氧训练：化疗周期的体力维持', icon: <Flame className="text-orange-400" /> }
  ]
};

export const getIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'heart': return <Heart className={className} />;
    case 'user': return <User className={className} />;
    case 'briefcase': return <Briefcase className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'utensils': return <Utensils className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'baby': return <Baby className={className} />;
    case 'home': return <Home className={className} />;
    case 'book': return <BookOpen className={className} />;
    case 'talk': return <MessageCircle className={className} />;
    case 'settings': return <Settings className={className} />;
    case 'calendar': return <Calendar className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'repeat': return <RotateCw className={className} />;
    case 'scale': return <Scale className={className} />;
    case 'ruler': return <Ruler className={className} />;
    case 'apple': return <Apple className={className} />;
    case 'shield': return <ShieldCheck className={className} />;
    case 'alert': return <AlertTriangle className={className} />;
    case 'file': return <FileText className={className} />;
    default: return <Stethoscope className={className} />;
  }
};

export const MOCK_ARTICLES = [
  { id: 1, title: '化疗期间如何保持职场沟通？', tag: '工作管理', cancer: '通用' },
  { id: 2, title: '乳腺癌术后手臂康复指南', tag: '康复运动', cancer: '乳腺癌' },
  { id: 3, title: '亲密关系：化疗药物会影响伴侣吗？', tag: '两性生活', cancer: '通用' },
  { id: 4, title: '天青色等烟雨，你的美不因脱发而逝', tag: '心态建设', cancer: '通用' }
];

export const MOCK_POSTS: SocialPost[] = [
  { 
    id: 'food_1', 
    author: '苏苏的食光', 
    content: '今天完成了第4次化疗，状态比预想的好！', 
    likes: 342, 
    favorites: 156,
    tags: ['美食'], 
    timestamp: Date.now() - 1800000,
    coverEmoji: '🌿',
  },
  { 
    id: 'item_1', 
    author: '气质青友', 
    content: '新买的假发真的很自然，推荐给姐妹们。', 
    likes: 215, 
    favorites: 567,
    tags: ['美物'], 
    timestamp: Date.now() - 7200000,
    coverEmoji: '🌿',
  },
  { 
    id: 'view_1', 
    author: '自由的风', 
    content: '回到公司第一天，同事们的关心很温暖。', 
    likes: 892, 
    favorites: 443,
    tags: ['美景'], 
    timestamp: Date.now() - 3600000,
    coverEmoji: '🌿',
  },
  { 
    id: 'essay_1', 
    author: '听雨的人', 
    content: '【美文】写给所有战友：关于那些细碎的勇敢。', 
    likes: 1205, 
    favorites: 890,
    tags: ['美文'], 
    timestamp: Date.now() - 86400000,
    coverEmoji: '📜',
  },
  { 
    id: 'food_2', 
    author: '果果妈', 
    content: '低糖版蓝莓慕斯，给康复中的自己一点甜。', 
    likes: 156, 
    favorites: 89,
    tags: ['美食'], 
    timestamp: Date.now() - 96400000,
    coverEmoji: '🍰',
  }
];
