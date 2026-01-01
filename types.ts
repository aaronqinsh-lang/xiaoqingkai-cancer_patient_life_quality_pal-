
export type TreatmentStatus = 'TREATMENT' | 'RECOVERY' | 'FOLLOWUP';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  cancerType: string;
  treatmentType: string[];
  treatmentStatus: TreatmentStatus;
  treatmentStartDate: string;
  currentCycle: number;
  partnerStatus: string;
  fertilityConcerns: boolean;
  height?: number;
  weight?: number;
  nutritionStatus?: string;
  detailedIllness?: string;
}

export type DaysMatterType = 'COUNT_UP' | 'COUNT_DOWN' | 'CYCLE';

export interface DaysMatterEvent {
  id: string;
  title: string;
  type: DaysMatterType;
  startDate: string;
  targetDate?: string;
  cycleDays?: number;
  endDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  subtopics: string[];
}

export interface SocialPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  favorites?: number;
  comments?: number;
  tags?: string[];
  timestamp: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  fullBody?: string; // 详情页的长文本内容
  coverEmoji?: string;
}
