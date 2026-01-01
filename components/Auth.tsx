
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Heart, Chrome, Loader2, ArrowRight, FlaskConical } from 'lucide-react';
import { COLORS } from '../constants';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: '验证邮件已发送，请检查收件箱。' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '认证失败，请重试。' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@xiaoyibao.com.cn',
        password: '123456'
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: '测试账户登录失败。' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Google 登录失败。' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden max-w-md mx-auto">
      {/* Visual Header */}
      <div className="relative h-64 flex flex-col items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.celadon}, ${COLORS.deepForest})` }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-celadon-200/20 rounded-full -ml-10 -mb-10 blur-xl" />
        
        <div className="z-10 bg-white p-4 rounded-3xl shadow-2xl mb-4 animate-float">
          <Heart className="w-10 h-10 text-celadon fill-celadon" />
        </div>
        <h1 className="z-10 text-3xl font-black text-white tracking-tight">小青卡</h1>
        <p className="z-10 text-white/80 text-sm mt-2 font-medium">陪伴每一位青友回归完整生活</p>
      </div>

      <div className="flex-1 px-8 pt-8 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{isLogin ? '欢迎回来' : '开启新生活'}</h2>
          <p className="text-gray-400 text-sm mt-1">{isLogin ? '登录以管理您的健康与进度' : '注册即刻获得权威医疗生活指导'}</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="电子邮箱"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-celadon outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!loading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="设置密码 (至少6位)"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-celadon outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-celadon text-white py-4 rounded-2xl font-bold shadow-lg shadow-celadon/20 flex items-center justify-center gap-2 hover:bg-celadon-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLogin ? '立即登录' : '立即注册'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gray-100"></div>
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">快捷通道</span>
          <div className="h-[1px] flex-1 bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="flex-1 bg-deepForest text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <FlaskConical className="w-4 h-4" />
            测试版一键登录
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex-1 bg-white border border-gray-100 py-3 rounded-2xl text-xs font-bold text-gray-600 shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-gray-400" />
            Google 登录
          </button>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-celadon-900"
          >
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 text-center pb-8 px-8">
        登录即表示您同意我们的 <span className="underline">服务协议</span> 和 <span className="underline">隐私政策</span>
      </p>
    </div>
  );
};

export default Auth;
