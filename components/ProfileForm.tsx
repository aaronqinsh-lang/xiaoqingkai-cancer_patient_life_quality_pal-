
import React, { useState } from 'react';
import { UserProfile, TreatmentStatus, Gender } from '../types';
import { Scale, Ruler, Apple, Stethoscope } from 'lucide-react';

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">编辑个人健康档案</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-sm">取消</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">您的昵称</label>
          <input
            type="text"
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-celadon focus:border-celadon"
            value={profile.name}
            onChange={e => setProfile({...profile, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">年龄</label>
          <input
            type="number"
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-celadon focus:border-celadon"
            value={profile.age}
            onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">肿瘤类型</label>
          <input
            type="text"
            placeholder="如：乳腺癌、肺癌"
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-celadon focus:border-celadon"
            value={profile.cancerType}
            onChange={e => setProfile({...profile, cancerType: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">当前治疗状态</label>
          <select
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-celadon focus:border-celadon"
            value={profile.treatmentStatus}
            onChange={e => setProfile({...profile, treatmentStatus: e.target.value as TreatmentStatus})}
          >
            <option value="TREATMENT">治疗中</option>
            <option value="RECOVERY">康复期</option>
            <option value="FOLLOWUP">长期随访</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Ruler className="w-3 h-3" /> 身高 (cm)
          </label>
          <input
            type="number"
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={profile.height || ''}
            onChange={e => setProfile({...profile, height: parseFloat(e.target.value)})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Scale className="w-3 h-3" /> 体重 (kg)
          </label>
          <input
            type="number"
            className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={profile.weight || ''}
            onChange={e => setProfile({...profile, weight: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Apple className="w-3 h-3" /> 营养状况
        </label>
        <select
          className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={profile.nutritionStatus || ''}
          onChange={e => setProfile({...profile, nutritionStatus: e.target.value})}
        >
          <option value="">请选择</option>
          <option value="良好">良好 (食欲正常，体重稳定)</option>
          <option value="中等">中等 (偶尔食欲不振)</option>
          <option value="较差">较差 (明显消瘦，难以进食)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Stethoscope className="w-3 h-3" /> 详细病情记录 (私密)
        </label>
        <textarea
          className="w-full border-slate-200 rounded-xl px-3 py-2 text-sm h-24 resize-none"
          placeholder="记录分期、基因突变情况等关键信息，仅存储在本地..."
          value={profile.detailedIllness || ''}
          onChange={e => setProfile({...profile, detailedIllness: e.target.value})}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-celadon-600 text-white font-bold py-3 rounded-xl hover:bg-celadon-900 transition-colors shadow-lg shadow-celadon/20"
      >
        更新健康档案
      </button>
    </form>
  );
};

export default ProfileForm;
